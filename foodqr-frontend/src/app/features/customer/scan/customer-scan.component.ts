import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-customer-scan',
  templateUrl: './customer-scan.component.html',
})
export class CustomerScanComponent implements OnInit, OnDestroy {
  scanning = false;
  cameraError = '';
  manualCode = '';
  private scanner: Html5Qrcode | null = null;
  private readonly elementId = 'customer-qr-scanner';

  constructor(private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.startScanning();
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }

  startScanning(): void {
    this.cameraError = '';
    this.scanning = true;
    this.scanner = new Html5Qrcode(this.elementId);
    this.scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        (decodedText) => this.handleScanResult(decodedText),
        () => {},
      )
      .catch(() => {
        this.cameraError = 'Camera access unavailable. Enter the table code below instead.';
        this.scanning = false;
      });
  }

  stopScanning(): void {
    if (this.scanner) {
      this.scanner.stop().catch(() => {});
      this.scanner.clear();
      this.scanner = null;
    }
    this.scanning = false;
  }

  private handleScanResult(decodedText: string): void {
    this.stopScanning();
    const slug = this.extractSlug(decodedText);
    if (!slug) {
      this.toastr.error('That QR code is not a valid table code.');
      this.startScanning();
      return;
    }
    this.router.navigate(['/table', slug, 'menu']);
  }

  submitManualCode(): void {
    const slug = this.extractSlug(this.manualCode.trim());
    if (!slug) {
      this.toastr.error('Enter a valid table code or URL.');
      return;
    }
    this.router.navigate(['/table', slug, 'menu']);
  }

  private extractSlug(value: string): string | null {
    if (!value) return null;
    const match = value.match(/\/table\/([^/?#]+)/);
    if (match) return match[1];
    return /^[a-zA-Z0-9-_]+$/.test(value) ? value : null;
  }
}
