import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  
  providers: [DatePipe] 
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordFieldType: string = 'password';
  dateNow!: string;
  isEmailFormVisible: boolean = true;  // Başlangıçta e-posta formunu gösterir
  isUsernameFormVisible: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService 
  ) {
    this.setDateNowWithOffset(15);
  }

  ngOnInit(): void {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 500);
    this.loginForm = this.fb.group({
      email: [''],
      username: [''],
      password: ['', Validators.required]
    });
  }
  private setDateNowWithOffset(minutes: number) {
    let now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    this.dateNow = this.datePipe.transform(now, 'yyyy-MM-dd HH:mm:ss')!;
  }

  showEmailForm() {
    this.isEmailFormVisible = true;
    this.isUsernameFormVisible = false;
  }

  showUsernameForm() {
    this.isEmailFormVisible = false;
    this.isUsernameFormVisible = true;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, username, password } = this.loginForm.value;
      this.authService.login(email, username, password).subscribe({
        next: (response) => {
          if (response.authenticateResult) {
            this.translate.get('LOGIN_SUCCESS').subscribe((res: string) => {
              this.toastr.success(res, 'Login Successful');
            });
  
            this.authService.getToken().subscribe({
              next: (token) => {
                localStorage.setItem("AuthToken", token);
                localStorage.setItem('DateNow', this.dateNow);
                this.authService.getCurrentUser().subscribe(user => {
                  if (user && user.isAdmin) {
                    this.router.navigate(['/admin']);
                  } else if (user) {
                    this.router.navigate(['all-books']);
                  }
                });
              },
              error: (error) => {
                console.log("Token alınamadı: ", error);
              }
            });
          } else {
            this.translate.get('LOGIN_FAIL').subscribe((res: string) => {
              this.toastr.error(res, 'Login Failed');
            });
          }
        },
        error: (error) => {
          this.translate.get('ERROR').subscribe((res1: string) => {
            this.translate.get('ERROR_OCCURED').subscribe((res2: string) => {
              this.toastr.error(res2, res1);
            });
          });
  
          console.error('Login failed', error);
        }
      });
    }
  }
  
}
