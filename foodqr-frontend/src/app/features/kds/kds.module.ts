import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { KdsComponent } from './kds.component';

const routes: Routes = [{ path: '', component: KdsComponent }];

@NgModule({
  declarations: [KdsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class KdsModule {}
