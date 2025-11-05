/**
 * Frontend Cookie Auth Verification Script
 * Run this in browser console after logging in to verify cookie-based auth
 */

console.log('🔍 FRONTEND COOKIE AUTH VERIFICATION\n');

// Test 1: Check localStorage (should be empty)
console.log('1️⃣ Checking localStorage for tokens...');
const token = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
if (!token && !refreshToken) {
  console.log('✅ PASS: No tokens in localStorage');
} else {
  console.error('❌ FAIL: Found tokens in localStorage:', { token, refreshToken });
}

// Test 2: Check cookies (should be blocked by HttpOnly)
console.log('\n2️⃣ Checking document.cookie access...');
const cookies = document.cookie;
if (cookies === '' || !cookies.includes('access_token')) {
  console.log('✅ PASS: Cookies are HttpOnly (JavaScript cannot access)');
} else {
  console.error('❌ FAIL: Cookies accessible to JavaScript:', cookies);
}

// Test 3: Check auth store
console.log('\n3️⃣ Checking auth store state...');
try {
  // Access Zustand store (if available)
  const authState = window.__ZUSTAND_DEVTOOLS_STORE__?.getState?.() || 
                    JSON.parse(localStorage.getItem('auth-storage') || '{}');
  
  if (authState.user && authState.isAuthenticated && !authState.token) {
    console.log('✅ PASS: Auth store has user, no token');
    console.log('   User:', authState.user.email);
    console.log('   Tier:', authState.subscriptionTier);
  } else if (authState.token) {
    console.error('❌ FAIL: Auth store still has token field:', authState.token);
  } else {
    console.warn('⚠️ WARNING: Cannot access auth store or not logged in');
  }
} catch (e) {
  console.warn('⚠️ WARNING: Cannot verify auth store:', e.message);
}

// Test 4: Check network requests
console.log('\n4️⃣ Checking network requests...');
console.log('📝 Instructions:');
console.log('   1. Open Network tab');
console.log('   2. Make any API request (navigate to a module)');
console.log('   3. Check request headers:');
console.log('      ✅ Should have: Cookie: access_token=...');
console.log('      ❌ Should NOT have: Authorization: Bearer ...');
console.log('   4. Check response headers on login:');
console.log('      ✅ Should have: Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax');

// Test 5: Simulate XSS attack
console.log('\n5️⃣ Simulating XSS token theft attempt...');
const xssAttempt = {
  localStorage_token: localStorage.getItem('access_token'),
  sessionStorage_token: sessionStorage.getItem('access_token'),
  cookie_access: document.cookie,
};

if (!xssAttempt.localStorage_token && !xssAttempt.sessionStorage_token && 
    !xssAttempt.cookie_access.includes('access_token')) {
  console.log('✅ PASS: XSS attack cannot steal tokens');
  console.log('   Attempted theft result:', xssAttempt);
} else {
  console.error('❌ FAIL: XSS attack could steal tokens:', xssAttempt);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log('✅ All checks passed = Cookie auth working correctly');
console.log('❌ Any failures = Security vulnerability exists');
console.log('\n🔒 Expected behavior:');
console.log('   • No tokens in localStorage/sessionStorage');
console.log('   • Cookies are HttpOnly (JS cannot access)');
console.log('   • Auth store has user but no token');
console.log('   • Network requests send Cookie header');
console.log('   • XSS attacks cannot steal credentials');
