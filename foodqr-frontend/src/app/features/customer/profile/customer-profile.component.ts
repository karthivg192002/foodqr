import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
})
export class CustomerProfileComponent implements OnInit {
  activeTab: 'profile' | 'addresses' = 'profile';
  user: Partial<User> = {};
  saving = false;

  // Addresses
  addresses: any[] = [];
  showAddressForm = false;
  savingAddress = false;
  editingAddress: any = null;
  addressForm: any = { label: 'Home', address: '', apartment: '', isDefault: false };

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const u = this.authService.currentUser;
    if (u) this.user = { name: u.name, email: u.email, phone: u.phone };
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.api.get<any[]>('addresses').subscribe({ next: (d) => this.addresses = d });
  }

  save(): void {
    this.saving = true;
    this.api.patch<User>('profile', this.user).subscribe({
      next: () => { this.toastr.success('Profile updated'); this.saving = false; },
      error: () => { this.saving = false; },
    });
  }

  openNewAddress(): void {
    this.editingAddress = null;
    this.addressForm = { label: 'Home', address: '', apartment: '', isDefault: false };
    this.showAddressForm = true;
  }

  openEditAddress(addr: any): void {
    this.editingAddress = addr;
    this.addressForm = { ...addr };
    this.showAddressForm = true;
  }

  saveAddress(): void {
    this.savingAddress = true;
    const req = this.editingAddress
      ? this.api.patch(`addresses/${this.editingAddress.id}`, this.addressForm)
      : this.api.post('addresses', this.addressForm);
    req.subscribe({
      next: () => {
        this.toastr.success(this.editingAddress ? 'Address updated' : 'Address added');
        this.showAddressForm = false;
        this.loadAddresses();
        this.savingAddress = false;
      },
      error: () => { this.savingAddress = false; },
    });
  }

  deleteAddress(id: string): void {
    if (!confirm('Delete this address?')) return;
    this.api.delete(`addresses/${id}`).subscribe({
      next: () => { this.toastr.success('Address deleted'); this.loadAddresses(); },
    });
  }

  setDefault(id: string): void {
    this.api.patch(`addresses/${id}`, { isDefault: true }).subscribe({
      next: () => { this.toastr.success('Default address set'); this.loadAddresses(); },
    });
  }

  logout(): void { this.authService.logout(); }
}
