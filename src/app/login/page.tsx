'use client'

import { useState, use } from 'react'
import { login, signup } from './actions'
import { Building2, Mail, Lock, Phone, User, ArrowRight, Loader2, Globe, AlertCircle } from 'lucide-react'

const loginTranslations = {
  so: {
    subtitle: "Nidaamka casriga ah ee maamulka guryaha iyo ururinta kirada (Zaad & eDahab).",
    signIn: "Soo gal (Sign In)",
    signUp: "Isdiiwangle (Sign Up)",
    businessName: "Magaca Ganacsiga",
    businessPlaceholder: "tusaale. Guryaha VIP",
    phone: "Lambarka Telefoonka",
    phonePlaceholder: "tusaale. 63XXXXXXX",
    email: "Email Address",
    emailPlaceholder: "magac@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    createAccount: "Abuur Account",
    loginBtn: "Soo Gal",
    help: "U baahan tahay caawimo? La xidhiidh: support@propmanage.so",
    errorTitle: "Cillad ayaa dhacday"
  },
  en: {
    subtitle: "Modern property management and rent collection system (Zaad & eDahab).",
    signIn: "Sign In",
    signUp: "Sign Up",
    businessName: "Business Name",
    businessPlaceholder: "e.g. VIP Properties",
    phone: "Phone Number",
    phonePlaceholder: "e.g. 63XXXXXXX",
    email: "Email Address",
    emailPlaceholder: "name@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    createAccount: "Create Account",
    loginBtn: "Sign In",
    help: "Need help? Contact: support@propmanage.so",
    errorTitle: "An error occurred"
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = use(searchParams)
  const queryError = resolvedParams?.error

  const [lang, setLang] = useState<'so' | 'en'>('so')
  const t = loginTranslations[lang]

  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const errorMsg = queryError || localError

  const handleSubmit = () => {
    setLoading(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* LANGUAGE SELECTOR IN TOP RIGHT */}
      <div className="absolute top-6 right-6 flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 z-20">
        <button
          onClick={() => setLang('so')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
            lang === 'so'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SOM</span>
        </button>
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
            lang === 'en'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>ENG</span>
        </button>
      </div>

      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-4 animate-pulse">
          <Building2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          PropManage Somaliland
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl border border-slate-800/80 sm:rounded-3xl sm:px-10 relative">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/50 text-rose-200 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-400">{t.errorTitle}</span>
                <span className="text-xs mt-0.5">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Sign In / Sign Up Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-8 border border-slate-800">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-emerald-500 text-slate-950 shadow-lg font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.signIn}
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-emerald-500 text-slate-950 shadow-lg font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.signUp}
            </button>
          </div>

          <form action={isSignUp ? signup : login} onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {t.businessName}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      name="businessName"
                      type="text"
                      required
                      placeholder={t.businessPlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {t.phone}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? t.createAccount : t.loginBtn}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Social Proof or Support Info */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-xs text-slate-500">
              {t.help}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
