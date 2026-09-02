import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ShieldCheck,
  RotateCw,
  Check
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  initialMode = 'signup',
  isMandatory = false 
}) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [step, setStep] = useState(1); // 1: Details form, 2: OTP Verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otpInputRefs = useRef([]);

  // Reset when opened or mode changed
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setStep(1);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  if (!isOpen) return null;

  // Mode switcher handler
  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setStep(1);
    setError('');
    setSuccessMsg('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Step 1: Handle Send OTP for Signup or Login Submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Direct Login Flow
    if (isLogin) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Login failed. Please check your credentials.');
        }

        setSuccessMsg('Welcome back! Logging you in...');
        if (data.token) {
          localStorage.setItem('an_studio_token', data.token);
        }

        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          if (onClose) onClose();
        }, 500);
      } catch (err) {
        setError(err.message || 'Login failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Sign Up Flow: Send OTP to Google / Email Account
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'signup' })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setSuccessMsg(data.message || 'Verification code sent to your email!');
      setStep(2);
      setResendTimer(60);
      
      // Focus first OTP input
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input handlers (supports copy-paste and keyboard navigation)
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    if (cleaned.length > 1) {
      setOtpDigits((prev) => {
        const next = [...prev];
        const chars = cleaned.slice(0, 6).split('');
        chars.forEach((char, i) => {
          if (index + i < 6) {
            next[index + i] = char;
          }
        });
        return next;
      });
      const nextIndex = Math.min(index + cleaned.length, 5);
      if (otpInputRefs.current[nextIndex]) {
        otpInputRefs.current[nextIndex].focus();
      }
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned.charAt(0);
      return next;
    });

    if (index < 5 && cleaned) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // Step 2: Handle OTP Verification and Account Creation
  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const completeOtp = otpDigits.join('');
    if (completeOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          otp: completeOtp
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please try again.');
      }

      setSuccessMsg('Account created and verified successfully!');
      if (data.token) {
        localStorage.setItem('an_studio_token', data.token);
      }

      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        if (onClose) onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'signup' })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }

      setSuccessMsg('A new verification code has been sent to your email.');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || 'Could not resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isMandatory ? 'rgba(3, 7, 18, 0.92)' : 'rgba(5, 8, 16, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={!isMandatory && onClose ? onClose : undefined}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(180deg, rgba(20, 26, 43, 0.98) 0%, rgba(11, 15, 25, 0.99) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 50px rgba(99, 102, 241, 0.2)',
          padding: '2.2rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background accent */}
        <div style={{
          position: 'absolute',
          top: '-70px',
          right: '-70px',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        {/* Close Button (Only visible if not mandatory) */}
        {!isMandatory && onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.45rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #c084fc 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.55rem',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem'
          }}>
            {step === 2 
              ? 'Verify Your Email' 
              : isLogin 
                ? 'Welcome Back' 
                : 'Create Your Account'}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
            {step === 2 
              ? `We sent a 6-digit code to ${email}`
              : isLogin 
                ? 'Sign in to access your AN AI Studio workspace' 
                : 'Sign up with Google/email to access all AI capabilities'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Only in Step 1) */}
        {step === 1 && (
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.4rem'
          }}>
            <button
              type="button"
              onClick={() => switchMode(false)}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '9px',
                border: 'none',
                background: !isLogin ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(56, 189, 248, 0.2))' : 'transparent',
                color: !isLogin ? '#38bdf8' : '#94a3b8',
                fontWeight: !isLogin ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              1. Create Account
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: '9px',
                border: 'none',
                background: isLogin ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(56, 189, 248, 0.2))' : 'transparent',
                color: isLogin ? '#38bdf8' : '#94a3b8',
                fontWeight: isLogin ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              2. Sign In
            </button>
          </div>
        )}

        {/* Error / Success Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.7rem 0.9rem',
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.82rem',
            marginBottom: '1.2rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <AlertCircle size={17} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.7rem 0.9rem',
            background: 'rgba(34, 197, 94, 0.14)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '10px',
            color: '#86efac',
            fontSize: '0.82rem',
            marginBottom: '1.2rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={17} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Account Details Form */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name Field (Sign Up only) */}
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                  borderRadius: '11px',
                  padding: '0 0.8rem'
                }}>
                  <User size={16} color="#64748b" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                  <input 
                    type="text"
                    placeholder="e.g. Ashar Naeem"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    style={{
                      width: '100%',
                      padding: '0.72rem 0',
                      background: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Field (Google / Email) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Google / Email Address
                </label>
                {!isLogin && (
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 500 }}>
                    OTP verification required
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.22)',
                borderRadius: '11px',
                padding: '0 0.8rem'
              }}>
                <Mail size={16} color="#64748b" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                <input 
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.72rem 0',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.22)',
                borderRadius: '11px',
                padding: '0 0.8rem',
                position: 'relative'
              }}>
                <Lock size={16} color="#64748b" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.72rem 0',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.78rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.75 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'none';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{isLogin ? 'Signing In...' : 'Sending Verification Code...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In & Access Account' : 'Verify Email with OTP'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '1.25rem 0'
            }}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, monospace',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: digit 
                      ? '2px solid #38bdf8' 
                      : '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    color: '#38bdf8',
                    outline: 'none',
                    boxShadow: digit ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {/* Verify & Create Account Button */}
            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={isLoading || otpDigits.join('').length !== 6}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.78rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                cursor: (isLoading || otpDigits.join('').length !== 6) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease',
                opacity: (isLoading || otpDigits.join('').length !== 6) ? 0.6 : 1
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying & Creating Account...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Verify OTP & Access Account</span>
                </>
              )}
            </button>

            {/* Resend & Back options */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.82rem'
            }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0
                }}
              >
                <ArrowLeft size={14} />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isResending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? '#64748b' : '#38bdf8',
                  cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0
                }}
              >
                <RotateCw size={13} style={{ animation: isResending ? 'spin 1s linear infinite' : 'none' }} />
                <span>
                  {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div style={{
          marginTop: '1.4rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>MongoDB Atlas Encrypted & Verified Auth</span>
        </div>
      </div>
    </div>
  );
}
