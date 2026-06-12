import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OssComponent } from './oss.component';

const routes: Routes = [{ path: '', component: OssComponent }];

@NgModule({
  declarations: [OssComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class OssModule {}
