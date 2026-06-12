import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableScanComponent } from './scan/table-scan.component';
import { TableMenuComponent } from './menu/table-menu.component';
import { TableCartComponent } from './cart/table-cart.component';
import { TableTrackComponent } from './track/table-track.component';
import { TableLayoutComponent } from './layout/table-layout.component';

const routes: Routes = [
  {
    path: '',
    component: TableLayoutComponent,
    children: [
      { path: ':slug', component: TableScanComponent },
      { path: ':slug/menu', component: TableMenuComponent },
      { path: ':slug/cart', component: TableCartComponent },
      { path: ':slug/track/:token', component: TableTrackComponent },
    ],
  },
];

@NgModule({
  declarations: [
    TableLayoutComponent,
    TableScanComponent,
    TableMenuComponent,
    TableCartComponent,
    TableTrackComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class TableModule {}
