# OTP Verification System

## Overview
The app includes a **simulated OTP system** for demo/portfolio purposes. OTPs are generated on the frontend and logged to the browser console for testing.

## How It Works

### 1. OTP Generation
- **When**: User clicks "Login" or "Sign Up"
- **What**: Random 6-digit code (e.g., 123456)
- **Where**: 
  - Stored in `localStorage` as `tempOTP`
  - Logged to browser console

### 2. OTP Validation
- User enters the 6-digit code
- System validates against stored OTP
- Checks expiry time (5 minutes)
- Allows up to 3 attempts

### 3. Console Output
When OTP is generated, you'll see:
```
🔐 OTP Generated: 123456
📱 Simulated SMS: Your verification code is: 123456
```

When OTP is verified:
```
✅ OTP Verification: Success
```
or
```
❌ OTP Verification: Failed
Expected: 123456 | Entered: 654321
```

## Testing the OTP

1. Open browser DevTools (F12) → Go to Console tab
2. Login or Signup
3. Look for: `🔐 OTP Generated: XXXXXX`
4. Copy the 6-digit code
5. Enter it on the OTP page
6. Success! ✅

## Features

### Security Features
- ✅ **Attempt Limit**: Maximum 3 incorrect attempts
- ✅ **Expiry**: OTP expires after 5 minutes
- ✅ **Auto-cleanup**: OTP removed after verification
- ✅ **Resend**: Request new OTP after 60 seconds

### User Experience
- Toast notifications for all actions
- 60-second countdown timer
- Attempt counter display
- Clear error messages
- Auto-navigation on success

## Testing Scenarios

**✅ Correct OTP**
- Enter the generated OTP → Navigate to Dashboard

**❌ Wrong OTP**
- Enter incorrect code → Error message, try again

**⏰ Expired OTP**
- Wait 5+ minutes → Try to verify → "OTP expired" error

**🔄 Resend OTP**
- Click "Resend code" after 60 seconds → New OTP generated

**🚫 Too Many Attempts**
- Enter wrong OTP 3 times → Locked out, redirected back

## Files Modified

- `src/pages/Login.tsx` - Generates OTP on login
- `src/pages/Signup.tsx` - Generates OTP on signup  
- `src/pages/OTP.tsx` - Validates OTP with all security checks

## localStorage Keys

- `tempOTP` - Current 6-digit OTP
- `otpTimestamp` - When OTP was generated (milliseconds)

## Configuration

**OTP Expiry Time**: 5 minutes
```typescript
const OTP_EXPIRY_TIME = 5 * 60 * 1000;
```

**Max Attempts**: 3
```typescript
if (attempts >= 2) { // 0,1,2 = 3 attempts
  toast.error("Too many attempts");
}
```

**Resend Timer**: 60 seconds
```typescript
const [timer, setTimer] = useState(60);
```

## For Production

When moving to production with real SMS:
1. Remove console.log statements
2. Move OTP generation to backend
3. Integrate SMS gateway (Twilio, AWS SNS, etc.)
4. Store OTP in database
5. Add rate limiting
