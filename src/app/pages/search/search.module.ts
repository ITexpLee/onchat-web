import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmptyModule } from 'src/app/components/empty/empty.module';
import { SkeletonItemModule } from 'src/app/components/skeleton-item/skeleton-item.module';
import { ForTrackByIdModule } from 'src/app/directives/for-track-by-id/for-track-by-id.module';
import { SharedModule } from 'src/app/modules/shared.module';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { SearchPageRoutingModule } from './search-routing.module';
import { SearchPage } from './search.page';
import { UserComponent } from './user/user.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SkeletonItemModule,
    EmptyModule,
    SharedModule,
    ScrollingModule,
    SearchPageRoutingModule,
    ForTrackByIdModule
  ],
  declarations: [
    SearchPage,
    UserComponent,
    ChatroomComponent
  ]
})
export class SearchPageModule { }
