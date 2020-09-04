import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuillModule } from 'ngx-quill';
import { BubbleToolbarComponent } from 'src/app/components/bubble-toolbar/bubble-toolbar.component';
import { DrawerComponent } from 'src/app/components/drawer/drawer.component';
import { RichTextEditorComponent } from 'src/app/components/modals/rich-text-editor/rich-text-editor.component';
import { SharedModule } from 'src/app/modules/shared.module';
import { MsgListComponent } from '../../components/msg-list/msg-list.component';
import { ChatPageRoutingModule } from './chat-routing.module';
import { ChatPage } from './chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    SharedModule,
    QuillModule.forRoot({
      placeholder: '在此处插入文字…'
    })
  ],
  declarations: [
    ChatPage,
    MsgListComponent,
    BubbleToolbarComponent,
    DrawerComponent,
    RichTextEditorComponent
  ],
  entryComponents: [
    BubbleToolbarComponent,
    RichTextEditorComponent
  ],
})
export class ChatPageModule { }
