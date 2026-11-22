import 'reflect-metadata';
import { AppDataSource } from '../src/database/dataSource';
import { AuthService } from '../src/services/AuthService';
import { requireAuth, requireRole, GraphQLContext } from '../src/graphql/context';
import { UserRole } from '../src/constants';
import { AuditLog } from '../src/entities';

async function verifyPhase4() {
  console.log('--- Phase 4 Verification: Authentication, Refresh Tokens & RBAC ---');
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const authService = new AuthService();
  const testEmail = `golfer_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  // 1. Test Registration
  console.log(`1. Testing registration for ${testEmail}...`);
  const registered = await authService.register({
    email: testEmail,
    password: testPassword,
    firstName: 'Tiger',
    lastName: 'Woods',
    country: 'US',
  });

  if (!registered.accessToken || !registered.refreshToken || !registered.user) {
    throw new Error('Registration failed to return tokens and user.');
  }
  console.log('Registration succeeded with JWT access & refresh tokens.');

  // 2. Test Login (Success)
  console.log('2. Testing login with valid credentials...');
  const loggedIn = await authService.login(testEmail, testPassword);
  if (!loggedIn.accessToken || loggedIn.user.email !== testEmail) {
    throw new Error('Login failed with valid credentials.');
  }
  console.log('Login succeeded.');

  // 3. Test Login (Invalid Password)
  console.log('3. Testing login with invalid password...');
  let wrongPassRejected = false;
  try {
    await authService.login(testEmail, 'WrongPassword999!');
  } catch (err: any) {
    wrongPassRejected = true;
    console.log('Login with incorrect password correctly rejected:', err.message);
  }
  if (!wrongPassRejected) {
    throw new Error('Security failure: invalid password was accepted!');
  }

  // 4. Test Refresh Token Rotation
  console.log('4. Testing refresh token rotation...');
  const oldRefreshToken = loggedIn.refreshToken;
  const rotated = await authService.refreshToken(oldRefreshToken);
  if (!rotated.accessToken || rotated.refreshToken === oldRefreshToken) {
    throw new Error('Token rotation failed: new refresh token was not generated.');
  }
  console.log('Refresh token rotation succeeded; new token issued.');

  // 5. Test Token Reuse / Theft Detection
  console.log('5. Testing refresh token theft detection (re-submitting old token)...');
  let theftDetected = false;
  try {
    await authService.refreshToken(oldRefreshToken);
  } catch (err: any) {
    if (err.message.includes('Security alert') || err.message.includes('already been used')) {
      theftDetected = true;
      console.log('Theft detection correctly triggered on token reuse:', err.message);
    } else {
      throw err;
    }
  }
  if (!theftDetected) {
    throw new Error('Security failure: token reuse was not detected!');
  }

  // Verify Audit Log was recorded
  const auditEntry = await AppDataSource.getRepository(AuditLog).findOne({
    where: { action: 'SECURITY_TOKEN_REUSE_DETECTED' },
    order: { createdAt: 'DESC' },
  });
  if (!auditEntry) {
    throw new Error('AuditLog entry was not created for token reuse security event!');
  }
  console.log('Security AuditLog successfully recorded token theft attempt.');

  // 6. Test GraphQL requireAuth guard
  console.log('6. Testing GraphQL requireAuth guard...');
  const mockUnauthContext: GraphQLContext = {
    req: {} as any,
    res: {} as any,
    user: null,
  };
  let unauthCaught = false;
  try {
    requireAuth(mockUnauthContext);
  } catch (err: any) {
    if (err.extensions?.code === 'UNAUTHENTICATED') {
      unauthCaught = true;
      console.log('requireAuth guard correctly threw UNAUTHENTICATED for anonymous request.');
    }
  }
  if (!unauthCaught) {
    throw new Error('requireAuth guard failed to throw UNAUTHENTICATED!');
  }

  // 7. Test GraphQL requireRole guard (RBAC)
  console.log('7. Testing GraphQL requireRole guard (Subscriber trying to access ADMIN endpoint)...');
  const mockSubscriberContext: GraphQLContext = {
    req: {} as any,
    res: {} as any,
    user: registered.user,
  };
  let forbiddenCaught = false;
  try {
    requireRole(mockSubscriberContext, [UserRole.ADMIN]);
  } catch (err: any) {
    if (err.extensions?.code === 'FORBIDDEN') {
      forbiddenCaught = true;
      console.log('requireRole guard correctly threw FORBIDDEN for subscriber role.');
    }
  }
  if (!forbiddenCaught) {
    throw new Error('requireRole guard failed to throw FORBIDDEN on role mismatch!');
  }

  await AppDataSource.destroy();
  console.log('--- Phase 4 Successfully Verified! ---');
}

verifyPhase4()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Phase 4 verification failed:', err);
    process.exit(1);
  });
