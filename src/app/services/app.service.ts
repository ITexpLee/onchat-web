import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { ResultCode, SocketEvent } from '../common/enums';
import { LOCATION, WINDOW } from '../common/tokens';
import { Result } from '../models/onchat.model';
import { AuthService } from './apis/auth.service';
import { FeedbackService } from './feedback.service';
import { GlobalData } from './global-data.service';
import { Overlay } from './overlay.service';
import { Socket } from './socket.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class Application {

  constructor(
    private router: Router,
    private swUpdate: SwUpdate,
    private overlay: Overlay,
    private globalData: GlobalData,
    private authService: AuthService,
    private tokenService: TokenService,
    private socket: Socket,
    private feedbackService: FeedbackService,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCATION) private location: Location,
  ) {
    this.socket.on(SocketEvent.Init).pipe(
      filter(({ code }: Result) => code === ResultCode.Unauthorized),
      tap(() => this.socket.disconnect()),
      mergeMap(() => this.authService.refresh(this.tokenService.folder.refresh))
    ).subscribe(({ code, data }: Result<string>) => {
      if (code !== ResultCode.Success) {
        return this.logout();
      }

      this.tokenService.store(data);
      this.socket.connect();
    });
  }

  logout() {
    this.globalData.reset();
    this.tokenService.clear();
    this.socket.disconnect();
    this.router.navigateByUrl('/user/login');
  }

  /**
   * 检测路由导航事件
   */
  detectNavigation() {
    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart:
          this.globalData.navigating = true;
          break;

        case event instanceof NavigationCancel:
          this.feedbackService.slightVibrate(); // 如果路由返回被取消，就震动一下，表示阻止

        case event instanceof NavigationEnd:
        case event instanceof NavigationError:
          this.globalData.navigating = false;
          break;
      }
    });
  }

  /**
   * 检测Socket.IO连接状态
   */
  detectSocketConnectStatus() {
    // 连接断开时
    this.socket.on(SocketEvent.Disconnect).pipe(
      // 用户登录后且客户端在前台
      filter(() => this.globalData.user !== null),
      filter(() => !this.document.hidden)
    ).subscribe(() => {
      this.overlay.toast('OnChat: 与服务器断开连接！');
    });

    // 连接失败时
    this.socket.on(SocketEvent.ReconnectError).pipe(
      filter(() => !this.document.hidden)
    ).subscribe(() => {
      this.overlay.toast('OnChat: 服务器连接失败！');
    });

    // 重连成功时
    this.socket.on(SocketEvent.Reconnect).pipe(
      filter(() => !this.document.hidden)
    ).subscribe(() => {
      this.overlay.toast('OnChat: 与服务器重连成功！');
    });
  }

  /**
   * 检测更新
   */
  detectUpdate() {
    this.swUpdate.unrecoverable.subscribe(() => this.overlay.alert({
      header: '应用程序已损坏',
      message: '即将重启以更新到新版本！',
      backdropDismiss: false,
    }).then(() => this.window.setTimeout(() => this.location.reload(), 2000)));

    this.swUpdate.versionUpdates.pipe(
      filter(event => event.type === 'VERSION_READY')
    ).subscribe(() => {
      this.overlay.alert({
        header: '新版本已就绪',
        message: '是否立即重启以更新到新版本？',
        backdropDismiss: false,
        confirmHandler: () => {
          this.overlay.loading('Installing…');
          this.swUpdate.activateUpdate().then(() => this.location.reload());
        }
      })
    });
  }

  /**
   * 初始化原生通知
   */
  initNotification() {
    if ('Notification' in this.window) {
      const granted = 'granted';
      Notification.permission !== granted && Notification.requestPermission().then((permission: string) => {
        permission === granted && this.overlay.toast('OnChat: 通知权限授权成功！');
      });
    }
  }
}
