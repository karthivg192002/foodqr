import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PosComponent } from './pos.component';

const routes: Routes = [{ path: '', component: PosComponent }];

@NgModule({
  declarations: [PosComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class PosModule {}
