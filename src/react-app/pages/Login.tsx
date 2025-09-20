import { useAuth } from '@getmocha/users-service/react';
import { Bike, Shield, Eye, Smartphone } from 'lucide-react';

export default function Login() {
  const { redirectToLogin, isPending } = useAuth();

  const handleLogin = async () => {
    try {
      await redirectToLogin();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CycleGuard</h1>
              <p className="text-slate-400">Safety Dashboard</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Advanced Bike Safety<br />
            <span className="text-blue-400">Monitoring Platform</span>
          </h2>

          <p className="text-xl text-slate-300 mb-8">
            Real-time crash detection, blind-spot monitoring, and emergency response 
            system for safer cycling.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Crash Detection</h3>
                <p className="text-slate-400 text-sm">Automatic impact detection with instant alerts</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Blind-Spot Monitoring</h3>
                <p className="text-slate-400 text-sm">Real-time vehicle detection and warnings</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold">Emergency Response</h3>
                <p className="text-slate-400 text-sm">Automatic contact notification system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
              <p className="text-slate-400">Sign in to access your safety dashboard</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 shadow-lg hover:shadow-xl"
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
