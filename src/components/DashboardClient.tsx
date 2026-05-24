'use client'

import { useState, useEffect, useRef } from 'react'
import { createProperty, createUnit, createTenantAndLease, terminateLease, updateLandlordProfile, generateInvoicesAction, payInvoiceManuallyAction } from '@/app/dashboard/actions'
import { 
  Building2, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Bell, 
  Search, 
  Plus, 
  Calendar, 
  LogOut,
  ChevronRight,
  Grid,
  X,
  PlusCircle,
  AlertCircle,
  Globe,
  Trash2,
  CheckCircle2,
  DollarSign,
  Printer,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Download,
  Menu,
  Copy,
  Wallet
} from 'lucide-react'

interface Property {
  id: string
  name: string
  address: string
}

interface Unit {
  id: string
  property_id: string
  unit_number: string
  rent_amount: number
  status: string
}

interface DashboardClientProps {
  user: any
  landlord: any
  properties: Property[]
  units: Unit[]
  leases: any[]
  invoices: any[]
  payments: any[]
  expenses: any[]
}

const translations = {
  so: {
    dashboard: "Dashboard-ka",
    properties: "Guryaha",
    tenants: "Kiraystayaasha",
    payments: "Lacagaha",
    reports: "Warbixinada",
    expenses: "Kharashaadka",
    addProperty: "Ku dar Guri",
    addUnit: "Ku dar Qol",
    settings: "Settings",
    support: "Caawimo",
    logout: "Ka Bax",
    searchPlaceholder: "Raadi guri, kirayste...",
    totalUnits: "Qolalka Guud",
    occupied: "La Degan Yahay",
    vacant: "Bannaan",
    monthlyRevenue: "Dakhliga Bishii",
    addNewTenant: "Ku dar Kirayste Cusub",
    registerLeaseDesc: "Diiwangkali heshiis kiro oo cusub",
    fullName: "Magaca Kiraystaha Oo Buuxa",
    phoneLabel: "Lambarka Telefoonka (Zaad/eDahab)",
    emergencyNameLabel: "Magaca Damiinka / Qofka labaad",
    emergencyPhoneLabel: "Telefoonka Damiinka / Qofka labaad",
    emergencyContactTh: "Damiinka / Lala Xidhiidho",
    vacantUnit: "Qolka Bannaan",
    selectUnit: "Dooro Qol",
    noVacantUnits: "Guri/Qol ma jiro. Marka hore ku dar dhisme iyo qol!",
    leaseStart: "Bilowga Kirada",
    createLeaseBtn: "Abuur Heshiiska Kirada",
    activeLeases: "Heshiisyada Kirada Firfircoon",
    realtimeOccupancy: "Xogta degenaanshaha ee hadda",
    tenantNameTh: "Magaca Kiraystaha",
    unitTh: "Qolka",
    rentAmountTh: "Kirada",
    leaseStartTh: "Bilowga",
    statusTh: "Status-ka",
    noActiveTenants: "Ma jiraan kiraystayaal firfircoon. Fadlan ku dar mid!",
    savePropertyBtn: "Keydi Guriga",
    propertyName: "Magaca Guriga/Dhismaha",
    address: "Cinwaanka",
    selectProperty: "Dooro Guriga",
    unitNumber: "Lambarka Qolka / Faahfaahinta",
    unitPlaceholder: "tusaale. Apartment A1 - 3 Qol, Suuli & Jiko",
    rentAmount: "Qiimaha Kirada ($)",
    saveUnitBtn: "Keydi Qolka",
    activeProperties: "Guryaha Firfircoon",
    clustersOverview: "Muuqaalka guud ee dhismaha",
    nextMaintenance: "Dayactirka Xiga",
    roofInspection: "Kormeerka saqafka sare ee Riverview",
    manageSchedule: "Maamul Jadwalka",
    successMsg: "Heshiiska kirada iyo kiraystaha si guul leh ayaa loo diiwangeliyay!",
    loadingText: "Waa la fulinayaa...",
    savePropertyTitle: "Ku dar Guri Cusub",
    saveUnitTitle: "Ku dar Qol Cusub",
    viewAll: "Arag Dhammaan",
    terminateLeaseBtn: "Jooji Kiro",
    confirmTerminate: "Ma hubtaa inaad rabto inaad joojiso heshiiskan kirada? Qolkani wuxuu dib u noqon doonaa BANNAAN.",
    propertiesList: "Dhismayaasha Ku Diiwaan Gashan",
    unitStatusOccupied: "La Degan Yahay",
    unitStatusVacant: "Bannaan",
    actionTh: "Hawlgal",
    recordedPayments: "Taariikhda Lacagaha La Qabtay",
    paymentMethodTh: "Qaabka Lacagta",
    transactionIdTh: "Transaction ID",
    dateTh: "Taariikhda",
    noPayments: "Weli wax lacag ah lama qaban bishan.",
    occupancyRate: "Boqolleyda Degenaanshaha",
    financialPerformance: "Warbixinta Dakhliga & Maaliyadda",
    revenueCollected: "Lacagaha la ururiyay",
    settingsTitle: "Maamulka Profile-ka",
    settingsDesc: "Ka badal magaca shirkadda iyo macluumaadka xidhiidhka halkan.",
    businessNameLabel: "Magaca Shirkadda / Company Name",
    companyPhoneLabel: "Lambarka Xidhiidhka Shirkadda",
    saveSettingsBtn: "Keydi Isbeddelada",
    settingsSuccess: "Macluumaadka shirkadda si guul leh ayaa loo cusbooneysiiyay!",
    invoices: "Biilasha Kirada",
    invoiceStatusPending: "Sugaya",
    invoiceStatusPaid: "La Bixiyay",
    invoiceStatusOverdue: "Dhaafay Xilligii",
    generateInvoicesBtn: "Dhal Biilasha Bisha",
    payManuallyBtn: "Bixi Gacanta (Cash)",
    printInvoiceBtn: "Daabac Rasiidhka",
    invoiceDateTh: "Xilliga Biilka",
    dueDateTh: "Xilliga U Dambeeya",
    amountTh: "Cadadka",
    totalPendingAmount: "Biilasha Dhiman",
    totalPaidAmount: "Biilasha La Bixiyay",
    overdueCount: "Biilasha La Soo Daahay",
    generateInvoicesSuccess: "Biilasha bishan si guul leh ayaa loo dhaliyay!",
    payInvoiceSuccess: "Lacagta biilka si guul leh ayaa loo kaydiyay!"
  },
  en: {
    dashboard: "Dashboard",
    properties: "Properties",
    tenants: "Tenants",
    payments: "Payments",
    reports: "Reports",
    expenses: "Expenses",
    addProperty: "Add Property",
    addUnit: "Add Unit",
    settings: "Settings",
    support: "Support",
    logout: "Log Out",
    searchPlaceholder: "Search properties, tenants...",
    totalUnits: "Total Units",
    occupied: "Occupied",
    vacant: "Vacant",
    monthlyRevenue: "Monthly Revenue",
    addNewTenant: "Add New Tenant",
    registerLeaseDesc: "Register a new lease agreement",
    fullName: "Full Name of Tenant",
    phoneLabel: "Phone Number (Zaad/eDahab)",
    emergencyNameLabel: "Guarantor / Second Contact Name",
    emergencyPhoneLabel: "Guarantor / Second Contact Phone",
    emergencyContactTh: "Guarantor / Emergency Contact",
    vacantUnit: "Vacant Unit",
    selectUnit: "Select Unit",
    noVacantUnits: "No vacant units. Add a property and unit first!",
    leaseStart: "Lease Start",
    createLeaseBtn: "Create Lease Agreement",
    activeLeases: "Active Leases",
    realtimeOccupancy: "Real-time occupancy info",
    tenantNameTh: "Tenant Name",
    unitTh: "Unit",
    rentAmountTh: "Rent Amount",
    leaseStartTh: "Lease Start",
    statusTh: "Status",
    noActiveTenants: "No active leases. Please add one!",
    savePropertyBtn: "Save Property",
    propertyName: "Property Name",
    address: "Address",
    selectProperty: "Select Property",
    unitNumber: "Unit Number / Details",
    unitPlaceholder: "e.g. Apartment A1 - 3 Rooms, Bath & Kitchen",
    rentAmount: "Rent Amount ($)",
    saveUnitBtn: "Save Unit",
    activeProperties: "Active Properties",
    clustersOverview: "Clusters overview",
    nextMaintenance: "Next Maintenance",
    roofInspection: "Riverview Apartments Roof Inspection",
    manageSchedule: "Manage Schedule",
    successMsg: "Lease agreement and tenant registered successfully!",
    loadingText: "Processing...",
    savePropertyTitle: "Add New Property",
    saveUnitTitle: "Add New Unit",
    viewAll: "View All",
    terminateLeaseBtn: "Terminate",
    confirmTerminate: "Are you sure you want to terminate this lease? The unit status will revert to VACANT.",
    propertiesList: "Registered Properties",
    unitStatusOccupied: "Occupied",
    unitStatusVacant: "Vacant",
    actionTh: "Action",
    recordedPayments: "Recorded Payments History",
    paymentMethodTh: "Method",
    transactionIdTh: "Transaction ID",
    dateTh: "Date",
    noPayments: "No payments recorded yet.",
    occupancyRate: "Occupancy Rate",
    financialPerformance: "Financial Performance & Income Report",
    revenueCollected: "Revenue Collected",
    settingsTitle: "Profile Settings",
    settingsDesc: "Change your company name and contact information here.",
    businessNameLabel: "Company / Business Name",
    companyPhoneLabel: "Company Contact Phone",
    saveSettingsBtn: "Save Changes",
    settingsSuccess: "Company settings updated successfully!",
    invoices: "Rent Invoices",
    invoiceStatusPending: "Pending",
    invoiceStatusPaid: "Paid",
    invoiceStatusOverdue: "Overdue",
    generateInvoicesBtn: "Generate Monthly Invoices",
    payManuallyBtn: "Pay Cash",
    printInvoiceBtn: "Print Receipt",
    invoiceDateTh: "Invoice Date",
    dueDateTh: "Due Date",
    amountTh: "Amount",
    totalPendingAmount: "Outstanding Rent",
    totalPaidAmount: "Collected Rent",
    overdueCount: "Overdue Invoices",
    generateInvoicesSuccess: "Monthly invoices generated successfully!",
    payInvoiceSuccess: "Invoice payment recorded successfully!"
  }
}

interface HelpTopic {
  id: string
  titleSo: string
  titleEn: string
  replySo: string
  replyEn: string
}

const helpTopics: HelpTopic[] = [
  {
    id: 'guri',
    titleSo: "🏠 Sida loo daro Guri",
    titleEn: "🏠 How to add a Property",
    replySo: `**🏠 Sida loo diiwangeliyo Guri/Dhisme cusub:**\n\n1. Guji qaybta **"Guryaha"** ee liiska bidix ama guji badhanka **"+ Ku dar Guri"**.\n2. Gali magaca dhismaha (tusaale. *Guryaha VIP-da* ama *Riverview Apartments*).\n3. Gali cinwaanka saxda ah (tusaale. *Jigjiga Yar, Hargeisa*).\n4. Guji badhanka **"Keydi Guriga"** si aad u dhammaystirto.\n\n*Fiiro gaar ah: Gurigu waa dhismaha guud oo ay qolalku ku dhex yaalaan.*`,
    replyEn: `**🏠 How to register a new Property/Building:**\n\n1. Click on **"Properties"** in the left menu or click the **"+ Add Property"** button.\n2. Enter the building name (e.g., *VIP Apartments* or *Riverview Apartments*).\n3. Enter the address (e.g., *Jigjiga Yar, Hargeisa*).\n4. Click the **"Save Property"** button to complete.\n\n*Note: A Property represents the main building structure containing individual units.*`
  },
  {
    id: 'qol',
    titleSo: "🔑 Sida Qol loogu daro",
    titleEn: "🔑 How to add a Unit",
    replySo: `**🔑 Sida Qol loogu daro Guri:**\n\n1. Guji badhanka **"+ Ku dar Qol"** ee dhanka bidix.\n2. Dooro Guriga uu qolku ku dhex yaalo (Property).\n3. Gali lambarka qolka iyo faahfaahintiisa (tusaale. *Dabaqa 2-aad, Albaabka 4 - 3 Qol & Suuli*).\n4. Gali qiimaha kirada ee bishii ($) (tusaale. *150*).\n5. Guji badhanka **"Keydi Qolka"** si aad u dhammaystirto.`,
    replyEn: `**🔑 How to add a Unit to a Property:**\n\n1. Click the **"+ Add Unit"** button on the left sidebar.\n2. Select the parent Property/Building.\n3. Enter the unit number and details (e.g., *2nd Floor, Door 4 - 3 Rooms & Bath*).\n4. Enter the monthly rent amount in USD (e.g., *150*).\n5. Click **"Save Unit"** to complete.`
  },
  {
    id: 'kirayste',
    titleSo: "👤 Diiwangelinta Kiraystaha",
    titleEn: "👤 Registering a Tenant",
    replySo: `**👤 Sida Kirayste loo diiwangeliyo & loogu xiro Qol:**\n\n1. Tag qaybta **"Kiraystayaasha"** ee dhanka bidix, ka dibna guji **"Ku dar Kirayste Cusub"**.\n2. Gali **Magaca Buuxa** ee kiraystaha iyo **Lambarka Telefoonkiisa** (oo loo isticmaali doono qaadista kirada).\n3. Gali magaca iyo telefoonka qofka u damaanad qaaday (Damiinka).\n4. Ka dooro **Qolka Bannaan** (System-ku wuxuu ku tusi doonaa kaliya qolalka banaan).\n5. Dooro taariikhda uu heshiisku bilaabmayo (Lease Start Date).\n6. Guji badhanka **"Abuur Heshiiska Kirada"**.\n\n*Nidaamku wuxuu si toos ah u dhalin doonaa biilkii bisha ugu horreysay, qolkuna wuxuu noqon doonaa mid la degan yahay.*`,
    replyEn: `**👤 How to register a Tenant & assign them to a Unit:**\n\n1. Go to the **"Tenants"** section in the left menu, then click **"Add New Tenant"**.\n2. Enter the tenant's **Full Name** and **Phone Number** (used for payment records).\n3. Enter the name and phone number of the guarantor (Damiin).\n4. Select a **Vacant Unit** (only units currently marked as vacant are listed).\n5. Select the lease start date.\n6. Click the **"Create Lease Agreement"** button.\n\n*The system will automatically generate the first month's invoice, and the unit status changes to occupied.*`
  },
  {
    id: 'biil',
    titleSo: "💵 Dhalinta & Bixinta Biilasha",
    titleEn: "💵 Generating & Paying Invoices",
    replySo: `**💵 Sida loo dhaliso biilasha bilaha xiga iyo bixinta gacanta:**\n\n* **Dhalinta Biilasha:** Bil kasta marka ay kow u tahay, tag qaybta **"Biilasha Kirada"** oo guji **"Dhal Biilasha Bisha"**. Tani waxay dhalin doontaa biilal cusub dhammaan heshiisyada firfircoon.\n* **Bixinta Gacanta:** Marka kiraystuhu kuu dhiibo lacag caddaan ah ama uu mobilka kuugu soo diro:\n  1. Tag qaybta **"Biilasha Kirada"**.\n  2. Dooro biilka markaas uu bixinayo oo guji **"Bixi Gacanta (Cash)"**.\n  3. Dooro habka uu u bixiyay (Cash, Zaad, ama eDahab).\n  4. Gali tixraaca (Transaction ID ama Ref) haddii ay jirto.\n  5. Guji **"Xaqiiji Lacagta"** si biilku u noqdo *La Bixiyay*.`,
    replyEn: `**💵 How to generate monthly invoices and record payments:**\n\n* **Generating Invoices:** At the start of each month, go to the **"Invoices"** section and click **"Generate Invoices"**. This creates monthly bills for all active leases.\n* **Recording Payments:** When a tenant pays via cash or mobile transfer:\n  1. Go to the **"Invoices"** section.\n  2. Find the invoice and click the **"Pay Manually (Cash)"** button.\n  3. Select the payment method (Cash, Zaad, or eDahab).\n  4. Enter the Transaction ID / Reference number if applicable.\n  5. Click **"Confirm & Record Payment"** to change the status to *Paid*.`
  },
  {
    id: 'daabac',
    titleSo: "🖨️ Daabacaadda Rasiidhada",
    titleEn: "🖨️ Printing Receipts",
    replySo: `**🖨️ Sida loo daabaco Rasiidhka ama PDF loogu badalo:**\n\n1. Tag qaybta **"Biilasha Kirada"** ama **"Lacagaha"**.\n2. Ka hel biilka la bixiyay ee aad rabto inaad u daabacdo rasiidhka.\n3. Guji badhanka **"Daabac Rasiidhka"** (oo leh astaanta daabacaha).\n4. Waxaa kuu furmi doona muraayad si qurux bayan loo qaabeeyay oo ku habboon warqadda A4. Waxaad si toos ah ugu diri kartaa daabacaha (printer) ama waxaad u kaydsan kartaa sidii PDF si aad ugu dirto WhatsApp-ka kiraystaha.`,
    replyEn: `**🖨️ How to print a receipt or save as PDF:**\n\n1. Go to either **"Invoices"** or **"Payments"** section.\n2. Find the paid invoice for which you want to print a receipt.\n3. Click the **"Print Receipt"** button (printer icon).\n4. A beautiful, print-ready document formatted for A4 paper will open. You can send it directly to a printer or save it as a PDF to share with the tenant via WhatsApp.`
  },
  {
    id: 'settings',
    titleSo: "📈 Warbixinnada & Habaynta",
    titleEn: "📈 Reports & Settings",
    replySo: `**📈 Sida loo arko Warbixinnada & loo beddelo Settings-ka:**\n\n* **Warbixinnada:** Tag qaybta **"Warbixinada"** ee bidixda si aad u aragto warbixin faahfaahsan oo ku saabsan lacagaha la ururiyay, biilasha dhiman, iyo boqolleyda degenaanshaha guryahaaga.\n* **Settings:** Tag qaybta **"Settings"** ee hoose si aad u bedesho magaca shirkadda (Business Name) iyo lambarka xiriirka. Macluumaadkan waxay si toos ah ugu soo baxayaan rasiidhada aad daabacayso.`,
    replyEn: `**📈 How to view Reports & manage Settings:**\n\n* **Reports:** Visit the **"Reports"** tab on the left menu to view charts and statistics on collected revenue, pending bills, and occupancy rates across all properties.\n* **Settings:** Visit the **"Settings"** tab in the bottom sidebar to update your company's name and contact number. These details will automatically appear on all printed receipts.`
  }
]

const getWhatsAppUrl = (phone: string, text: string) => {
  if (!phone) return null
  const cleaned = phone.replace(/[^\d+]/g, '')
  const numbersOnly = cleaned.replace(/^\+/, '').replace(/^0+/, '')
  let targetPhone = numbersOnly
  if (targetPhone.length === 9 && (targetPhone.startsWith('63') || targetPhone.startsWith('65'))) {
    targetPhone = '252' + targetPhone
  } else if (targetPhone.length === 7) {
    targetPhone = '25263' + targetPhone
  }
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
}


export default function DashboardClient({
  user,
  landlord,
  properties = [],
  units = [],
  leases = [],
  invoices = [],
  payments = [],
  expenses = []
}: DashboardClientProps) {
  // Navigation states
  const [activeSection, setActiveSection] = useState<'dashboard' | 'properties' | 'tenants' | 'invoices' | 'payments' | 'expenses' | 'reports' | 'settings'>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Language state
  const [lang, setLang] = useState<'so' | 'en'>('so')
  const t = translations[lang]

  // Modal states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ZAAD' | 'EDAHAB'>('CASH')
  const [providerTransactionId, setProviderTransactionId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  
  // Profile Edit states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(landlord?.avatar_url || null)
  
  // Help & AI Center states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setChatMessages([
      {
        sender: 'ai',
        text: lang === 'so' 
          ? "Salaan! Waxaan ahay Caawiyahaaga AI ee PropManage. Waxaan kugu caawin karaa inaad fahamto sida nidaamku u shaqeeyo bilow ilaa dhammaad. Fadlan guji mid ka mid ah su'aalaha diyaarka ah ee hoose ama ii soo qor su'aashaada!"
          : "Hello! I am your PropManage AI Assistant. I can help you understand how the system works from start to finish. Please click one of the quick questions below or type your message!"
      }
    ])
  }, [lang])

  useEffect(() => {
    if (isHelpModalOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isHelpModalOpen])

  const handleSendHelpMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setChatInput('')

    setTimeout(() => {
      const lower = userMsg.toLowerCase()
      let matchedTopic = null

      if (lower.includes('guri') || lower.includes('house') || lower.includes('dhismaha') || lower.includes('property') || lower.includes('properties')) {
        matchedTopic = helpTopics.find(t => t.id === 'guri')
      } else if (lower.includes('qol') || lower.includes('unit') || lower.includes('room') || lower.includes('rooms')) {
        matchedTopic = helpTopics.find(t => t.id === 'qol')
      } else if (lower.includes('kirayste') || lower.includes('tenant') || lower.includes('lease') || lower.includes('heshiis')) {
        matchedTopic = helpTopics.find(t => t.id === 'kirayste')
      } else if (lower.includes('biil') || lower.includes('invoice') || lower.includes('lacag') || lower.includes('bixi') || lower.includes('payment') || lower.includes('pay')) {
        matchedTopic = helpTopics.find(t => t.id === 'biil')
      } else if (lower.includes('daabac') || lower.includes('print') || lower.includes('rasiidh') || lower.includes('receipt')) {
        matchedTopic = helpTopics.find(t => t.id === 'daabac')
      } else if (lower.includes('settings') || lower.includes('profile') || lower.includes('shirkad') || lower.includes('company') || lower.includes('currency')) {
        matchedTopic = helpTopics.find(t => t.id === 'settings')
      }

      if (matchedTopic) {
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          text: lang === 'so' ? matchedTopic.replySo : matchedTopic.replyEn 
        }])
      } else {
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          text: lang === 'so' 
            ? "Mowduuca aad qortay si fiican uma fahmin. Fadlan isticmaal mid ka mid ah badhamada hoose si aad hagitaan toos ah u hesho, ama nagala soo xiriir WhatsApp."
            : "I did not fully understand your topic. Please click one of the quick buttons below to get detailed guidance, or contact us via WhatsApp."
        }])
      }
    }, 600)
  }

  const handleQuickQuestion = (topicId: string) => {
    const topic = helpTopics.find(t => t.id === topicId)
    if (!topic) return

    const questionText = lang === 'so' ? topic.titleSo : topic.titleEn
    setChatMessages(prev => [...prev, { sender: 'user', text: questionText }])

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: lang === 'so' ? topic.replySo : topic.replyEn 
      }])
    }, 400)
  }

  
  // Form states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invoices section states
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL')

  // Currency aware formatting helper
  const orgCurrency = landlord?.organizations?.currency_code || 'USD'
  const formatCurrency = (amount: number, currency: string = orgCurrency) => {
    const code = currency?.toUpperCase() || 'USD'
    if (code === 'SLSH') {
      return `${Math.round(amount).toLocaleString('en-US')} SLSH`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculations
  const totalUnits = units.length
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
  const vacantUnits = units.filter(u => u.status === 'VACANT')
  const vacantUnitsCount = vacantUnits.length
  
  // Calculate total monthly revenue from occupied units
  const totalRevenueNum = units
    .filter(u => u.status === 'OCCUPIED')
    .reduce((sum, u) => sum + Number(u.rent_amount), 0)
  const monthlyRevenue = formatCurrency(totalRevenueNum, orgCurrency)

  // Invoice stats calculations
  const pendingUSD = invoices
    .filter(inv => inv.status === 'PENDING' && inv.currency_code === 'USD')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const pendingSLSH = invoices
    .filter(inv => inv.status === 'PENDING' && inv.currency_code === 'SLSH')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const paidUSD = invoices
    .filter(inv => inv.status === 'PAID' && inv.currency_code === 'USD')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const paidSLSH = invoices
    .filter(inv => inv.status === 'PAID' && inv.currency_code === 'SLSH')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const overdueUSD = invoices
    .filter(inv => inv.status === 'OVERDUE' && inv.currency_code === 'USD')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const overdueSLSH = invoices
    .filter(inv => inv.status === 'OVERDUE' && inv.currency_code === 'SLSH')
    .reduce((sum, inv) => sum + Number(inv.amount), 0)

  const totalOverdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length

  // Expenses calculations
  const totalExpensesUSD = expenses
    .filter(exp => exp.currency_code === 'USD')
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  const totalExpensesSLSH = expenses
    .filter(exp => exp.currency_code === 'SLSH')
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  // Net Profit
  const netProfitUSD = paidUSD - totalExpensesUSD
  const netProfitSLSH = paidSLSH - totalExpensesSLSH

  // Filtered invoices list
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.tenant_name_snapshot?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.unit_name_snapshot?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase())
      
    const matchesFilter = 
      invoiceFilter === 'ALL' || 
      inv.status === invoiceFilter

    return matchesSearch && matchesFilter
  })

  // Handlers
  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError(null)
    const formData = new FormData(form)
    try {
      await createProperty(formData)
      setIsPropertyModalOpen(false)
      form.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError(null)
    const formData = new FormData(form)
    try {
      await createUnit(formData)
      setIsUnitModalOpen(false)
      form.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLease = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError(null)
    const formData = new FormData(form)
    try {
      await createTenantAndLease(formData)
      form.reset()
      alert(t.successMsg)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateLease = async (leaseId: string, unitId: string) => {
    if (!window.confirm(t.confirmTerminate)) return
    setLoading(true)
    setError(null)
    try {
      await terminateLease(leaseId, unitId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    setError(null)
    const formData = new FormData(form)
    try {
      await updateLandlordProfile(formData)
      alert(t.settingsSuccess)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInvoices = async () => {
    if (!window.confirm(lang === 'so' ? 'Ma hubtaa inaad rabto inaad dhasho biilasha bishan?' : 'Are you sure you want to generate monthly invoices?')) return
    setLoading(true)
    setError(null)
    try {
      const count = await generateInvoicesAction()
      alert(lang === 'so' ? `Si guul leh ayaa loo dhaliyay ${count} biilal!` : `Successfully generated ${count} invoices!`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (profileAvatar) {
      formData.append('avatarUrl', profileAvatar)
    }
    try {
      await updateLandlordProfile(formData)
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePayInvoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInvoiceId || !paymentAmount) return
    setLoading(true)
    setError(null)
    try {
      const txnId = await payInvoiceManuallyAction(selectedInvoiceId, paymentMethod, providerTransactionId, Number(paymentAmount))
      alert(lang === 'so' 
        ? `Lacagta si guul leh ayaa loo kaydiyay! ID-ga rasiidhka: ${txnId}` 
        : `Payment recorded successfully! Txn ID: ${txnId}`)
      setIsPaymentModalOpen(false)
      setSelectedInvoiceId(null)
      setProviderTransactionId('')
      setPaymentAmount('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintInvoice = (invoice: any) => {
    const landlordName = landlord?.business_name || 'PropManage Suite'
    const landlordPhone = landlord?.phone || '63XXXXXXX'
    const tenantName = invoice.tenant_name_snapshot
    const unitNo = invoice.unit_name_snapshot
    const amountStr = formatCurrency(invoice.amount, invoice.currency_code)
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-GB')
    const billDate = new Date(invoice.created_at).toLocaleDateString('en-GB')
    const isPartial = invoice.amount_paid > 0 && invoice.amount_paid < invoice.amount;
    const statusText = lang === 'so' 
      ? (invoice.status === 'PAID' ? 'LA BIXIYAY / PAID' : isPartial ? 'QAYB BIXIN / PARTIAL' : invoice.status === 'OVERDUE' ? 'DHAAFAY / OVERDUE' : 'WALI TAAGAN / PENDING')
      : (isPartial ? 'PARTIAL' : invoice.status)
    const statusClass = invoice.status === 'PAID' 
      ? 'status-paid' 
      : isPartial
      ? 'status-partial'
      : invoice.status === 'OVERDUE' 
      ? 'status-overdue' 
      : 'status-pending'

    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Rasiidhka Biilka - ${tenantName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; }
            }
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 0;
              margin: 0;
              color: #1e293b;
              background-color: #ffffff;
              font-size: 14px;
              line-height: 1.5;
            }
            .invoice-card {
              max-width: 800px;
              margin: 0 auto;
              padding: 10px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-info h1 {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 5px 0;
              text-transform: uppercase;
            }
            .company-info p {
              margin: 2px 0;
              color: #64748b;
              font-size: 13px;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h2 {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 10px 0;
              letter-spacing: 0.5px;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              font-weight: 700;
              font-size: 12px;
              border-radius: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
              border: 1px solid #a7f3d0;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
              border: 1px solid #fde68a;
            }
            .status-overdue {
              background-color: #fee2e2;
              color: #991b1b;
              border: 1px solid #fca5a5;
            }
            .status-partial {
              background-color: #eff6ff;
              color: #1d4ed8;
              border: 1px solid #bfdbfe;
            }
            .details-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .details-box h3 {
              font-size: 11px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 10px 0;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 5px;
            }
            .details-box p {
              margin: 4px 0;
              font-size: 14px;
              color: #334155;
            }
            .details-box .name {
              font-weight: 700;
              color: #0f172a;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 50px;
            }
            .invoice-table th {
              background-color: #f8fafc;
              color: #475569;
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 12px 16px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }
            .invoice-table td {
              padding: 16px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            .invoice-table th.text-right, .invoice-table td.text-right {
              text-align: right;
            }
            .total-row {
              background-color: #f8fafc;
              font-weight: 800;
              font-size: 16px;
              color: #0f172a;
            }
            .total-row td {
              border-top: 2px solid #cbd5e1;
              border-bottom: 2px solid #cbd5e1;
            }
            .footer {
              text-align: center;
              margin-top: 100px;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              color: #94a3b8;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding: 15px; text-align: center; background: #f8fafc; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px;">
            <button onclick="window.close()" style="padding: 10px 15px; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 10px; cursor: pointer;">⬅ Xir (Close)</button>
            <button onclick="window.print()" style="padding: 10px 15px; background: #0066cc; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">🖨 Daabac (Print)</button>
          </div>
          <div class="invoice-card">
            <div class="header">
              <div class="company-info">
                <h1>${landlordName}</h1>
                <p>Tel: ${landlordPhone}</p>
                <p>Hargeisa, Somaliland</p>
              </div>
              <div class="invoice-title">
                <h2>RASIIDH / RECEIPT</h2>
                <div class="status-badge ${statusClass}">
                  ${statusText}
                </div>
              </div>
            </div>

            <div class="details-grid">
              <div class="details-box">
                <h3>Ku Socota (Bill To)</h3>
                <p class="name">${tenantName}</p>
                <p>Kiraystaha Qolka / Tenant</p>
              </div>
              <div class="details-box">
                <h3>Faahfaahinta Biilka (Invoice Info)</h3>
                <p><strong>Invoice ID:</strong> #${invoice.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Taariikhda (Date):</strong> ${billDate}</p>
                <p><strong>Dhamaystira (Due Date):</strong> ${dueDate}</p>
              </div>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description (Faahfaahinta)</th>
                  <th>Property / Unit</th>
                  <th class="text-right">Amount (Qiimaha)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Kirada bisha (Monthly Rent Charge)</td>
                  <td>${unitNo}</td>
                  <td class="text-right font-extrabold">${amountStr}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="2">TOTAL (WADARTA GUUD)</td>
                  <td class="text-right">${amountStr}</td>
                </tr>
                ${isPartial ? `
                <tr>
                  <td colspan="2" style="text-align: right; font-weight: bold; padding-top: 15px; color: #64748b; font-size: 13px;">Wadarta La Bixiyay (Amount Paid):</td>
                  <td class="text-right" style="padding-top: 15px; font-weight: bold; color: #1d4ed8;">${formatCurrency(invoice.amount_paid, invoice.currency_code)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: right; font-weight: 800; color: #dc2626; font-size: 14px; padding-top: 5px;">Haraadi (Balance Due):</td>
                  <td class="text-right" style="color: #dc2626; font-weight: 900; padding-top: 5px; font-size: 16px;">${formatCurrency(invoice.amount - invoice.amount_paid, invoice.currency_code)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>

            <div class="footer">
              <p>Waad ku mahadsantahay doorashadaada! / Thank you for your business!</p>
              <p>Powered by PropManage Suite</p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handlePrintContract = (lease: any) => {
    const unitObj = units.find(u => u.id === lease.unit_id)
    const propId = unitObj?.property_id
    const prop = properties.find(p => p.id === propId)
    const propName = prop ? prop.name : 'Dhismaha Maareysan'
    const propAddress = prop ? prop.address : 'Hargeisa, Somaliland'
    const landlordName = landlord?.business_name || 'PropManage Suite'
    const landlordPhone = landlord?.phone || '63XXXXXXX'
    const tenantName = lease.tenants?.name || 'Kirayste'
    const tenantPhone = lease.tenants?.phone || '63XXXXXXX'
    const guarantorName = lease.tenants?.emergency_contact_name || 'Ma jiro'
    const guarantorPhone = lease.tenants?.emergency_contact_phone || 'Ma jiro'
    const unitNo = lease.units?.unit_number || 'N/A'
    const rent = lease.units?.rent_amount || '0'
    const startDate = new Date(lease.start_date).toLocaleDateString('en-GB')

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Heshiiska Kirada - ${tenantName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; background-color: #ffffff; }
            }
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 0;
              margin: 0;
              color: #000000;
              background-color: #ffffff;
              line-height: 1.4;
            }
            .border-outer {
              border: 3px double #000000;
              padding: 20px;
              box-sizing: border-box;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px solid #000000;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 22px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #000000;
            }
            .subtitle {
              font-size: 11px;
              font-weight: bold;
              color: #000000;
              text-transform: uppercase;
              margin-top: 5px;
            }
            h1 {
              font-size: 16px;
              text-align: center;
              text-transform: uppercase;
              color: #000000;
              margin-top: 10px;
              margin-bottom: 15px;
              text-decoration: underline;
              letter-spacing: 0.5px;
            }
            h2 {
              font-size: 12px;
              color: #000000;
              border-bottom: 1px solid #000000;
              padding-bottom: 3px;
              margin-top: 12px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            td {
              padding: 4px 0;
              font-size: 12px;
              vertical-align: top;
              color: #000000;
            }
            .label {
              font-weight: bold;
              width: 30%;
            }
            .value {
              width: 70%;
            }
            .terms {
              font-size: 11.5px;
              color: #000000;
              text-align: justify;
            }
            .terms ol {
              padding-left: 20px;
              margin: 0;
            }
            .terms li {
              margin-bottom: 6px;
            }
            .signatures {
              margin-top: 25px;
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 20px;
            }
            .sig-box {
              border-top: 1px solid #000000;
              text-align: center;
              padding-top: 5px;
              font-size: 11px;
              font-weight: bold;
              color: #000000;
              margin-top: 30px;
            }
            .footer-warning {
              border: 1px solid #000000;
              padding: 8px;
              text-align: center;
              background-color: #ffffff;
              margin-top: 20px;
              font-size: 10px;
              color: #000000;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding: 15px; text-align: center; background: #f8fafc; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px;">
            <button onclick="window.close()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 10px; cursor: pointer;">⬅ Ku Noqo Dashboard-ka (Back)</button>
            <button onclick="window.print()" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">🖨 Daabac (Print)</button>
          </div>
          <div class="border-outer">
            <div class="header">
              <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 5px;">
                <img src="/logo.jpeg" style="max-width: 60px; max-height: 60px; object-fit: contain;" onerror="this.style.display='none'; document.getElementById('fallback-logo').style.display='block';" />
                <svg id="fallback-logo" style="display: none; width: 40px; height: 40px; color: #1e293b;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/>
                  <path d="M10 10h4"/>
                  <path d="M10 14h4"/>
                  <path d="M10 18h4"/>
                </svg>
                <div class="company-name">${landlordName}</div>
              </div>
              <div class="subtitle">HESHIISKA KIREYSASHADA DHISMAHA / LEASE AGREEMENT</div>
            </div>

            <h1>HESHIIS KIRA DHISMAHO / LEASE AGREEMENT</h1>

            <h2>1. QAYBAHA HESHIISKA / PARTIES OF LEASE</h2>
            <table>
              <tr>
                <td class="label">Mulkiilaha (Landlord):</td>
                <td class="value"><strong>${landlordName}</strong> (Tel: ${landlordPhone})</td>
              </tr>
              <tr>
                <td class="label">Kiraystaha (Tenant):</td>
                <td class="value"><strong>${tenantName}</strong> (Tel: ${tenantPhone})</td>
              </tr>
              <tr>
                <td class="label">Damiinka (Guarantor):</td>
                <td class="value"><strong>${guarantorName}</strong> (Tel: ${guarantorPhone})</td>
              </tr>
            </table>

            <h2>2. MACLUUMAADKA DHISMAHA / PROPERTY DESCRIPTION</h2>
            <table>
              <tr>
                <td class="label">Dhismaha (Property):</td>
                <td class="value">${propName} (Address: ${propAddress})</td>
              </tr>
              <tr>
                <td class="label">Qolka (Unit/No):</td>
                <td class="value"><strong>${unitNo}</strong></td>
              </tr>
              <tr>
                <td class="label">Qiimaha Kirada (Rent):</td>
                <td class="value"><strong>$${rent} USD</strong> bishii (Per Month)</td>
              </tr>
            </table>

            <h2>3. SHURUUDAHA HESHIISKA / TERMS & CONDITIONS</h2>
            <div class="terms">
              <ol>
                <li><strong>Bixinta Kirada (Payment):</strong> Kiraystuhu wuxuu ogolaaday inuu bixiyo kirada dhan $${rent} USD bishiiba, taasoo lagu bixin doono Zaad/eDahab muddo 5 maalmood gudahood ah laga bilaabo kowda bisha.</li>
                <li><strong>Heshiiska Bilowga (Lease Term):</strong> Heshiiskani wuxuu bilaabmayaa taariikhda <strong>${startDate}</strong> wuxuuna shaqaynayaa ilaa inta labada dhinac midkood soo codsanayo joojinta heshiiska muddo 30 maalmood ka hor.</li>
                <li><strong>Masuuliyadda Dhismaha (Use & Care):</strong> Kiraystuhu waa inuu ku hayo dhismaha nadaafad iyo badbaado. Wixii dayactir ee ka yimaada isticmaalka kiraystaha isaga ayaa bixinaya, wixii dayactir dabiici ah ee dhismaha ku saabsan waxaa bixinaya Mulkiilaha.</li>
                <li><strong>Sharciga Dalka (Governing Law):</strong> Heshiiskan waxaa maamulaya shuruucda dhulka ee Jamhuuriyadda Somaliland, wixii khilaaf ah ee ka yimaadana waxaa lagu xalin doonaa maxkamadaha dalka ama odayaal dhaqameed.</li>
              </ol>
            </div>

            <div class="signatures">
              <div class="sig-box">
                Saxeexa Mulkiilaha (Landlord)<br/><br/>
                ___________________________
              </div>
              <div class="sig-box">
                Saxeexa Kiraystaha (Tenant)<br/><br/>
                ___________________________
              </div>
              <div class="sig-box">
                Saxeexa Damiinka (Guarantor)<br/><br/>
                ___________________________
              </div>
            </div>

            <div class="footer-warning">
              Digniin: Heshiiskani waa dukumenti sharci ah oo gaar u ah shirkadda kor ku xusan. Wax kasta oo laga badalo ama la masaxo wuxuu burinayaa ansaxnimadiisa.
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleExportCSV = () => {
    const headers = [
      lang === 'so' ? 'Lambarka Biilka' : 'Invoice ID',
      lang === 'so' ? 'Magaca Kiraystaha' : 'Tenant Name',
      lang === 'so' ? 'Qolka' : 'Unit',
      lang === 'so' ? 'Cadadka' : 'Amount',
      lang === 'so' ? 'Lacagta' : 'Currency',
      lang === 'so' ? 'Xaaladda' : 'Status',
      lang === 'so' ? 'Xilliga Bixinta' : 'Due Date'
    ]
    
    const rows = invoices.map(inv => [
      inv.id,
      `"${inv.tenant_name_snapshot}"`,
      `"${inv.unit_name_snapshot}"`,
      inv.amount,
      inv.currency_code,
      inv.status,
      new Date(inv.due_date).toLocaleDateString('en-GB')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `PropManage_Reports_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-screen w-full max-w-full overflow-hidden bg-[#f8fafc] flex relative text-slate-800">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* 1. LEFT SIDEBAR */}
      <aside className={`fixed md:relative inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 z-50 h-full`}>
        <div>
          {/* Logo */}
          <div className="flex flex-col mb-8">
            <span className="text-xl font-extrabold text-[#0066cc] tracking-tight">PropManage</span>
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'so' ? 'Nidaamka Maamulka Kirada' : 'Management Suite'}
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <button 
              onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'dashboard'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className={`w-5 h-5 ${activeSection === 'dashboard' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.dashboard}</span>
            </button>
            <button 
              onClick={() => { setActiveSection('properties'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'properties'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className={`w-5 h-5 ${activeSection === 'properties' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.properties} ({properties.length})</span>
            </button>
            <button 
              onClick={() => { setActiveSection('tenants'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'tenants'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className={`w-5 h-5 ${activeSection === 'tenants' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.tenants}</span>
            </button>
            <button 
              onClick={() => { setActiveSection('invoices'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'invoices'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Receipt className={`w-5 h-5 ${activeSection === 'invoices' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.invoices}</span>
            </button>
            <button 
              onClick={() => { setActiveSection('payments'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'payments'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className={`w-5 h-5 ${activeSection === 'payments' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.payments}</span>
            </button>
            <button 
              onClick={() => { setActiveSection('expenses'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'expenses'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Wallet className={`w-5 h-5 ${activeSection === 'expenses' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.expenses}</span>
            </button>
            <button 
              onClick={() => { setActiveSection('reports'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeSection === 'reports'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-5 h-5 ${activeSection === 'reports' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.reports}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setIsPropertyModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addProperty}</span>
            </button>
            <button 
              onClick={() => setIsUnitModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#0066cc] font-bold text-xs rounded-xl border border-blue-100 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addUnit}</span>
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <button 
              onClick={() => { setActiveSection('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all text-left ${
                activeSection === 'settings'
                  ? 'text-[#0066cc] bg-blue-50/50'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-5 h-5 ${activeSection === 'settings' ? 'text-[#0066cc]' : 'text-slate-400'}`} />
              <span>{t.settings}</span>
            </button>
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-left"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span>{t.support}</span>
            </button>
            <form action="/auth/signout" method="post" className="w-full">
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                <LogOut className="w-5 h-5 text-red-400" />
                <span>{t.logout}</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block w-96">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* LANGUAGE SWITCHER */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setLang('so')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'so'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SOM</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ENG</span>
              </button>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-[1px] h-6 bg-slate-100" />
            
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 -mr-1.5 rounded-xl transition-all cursor-pointer text-left group"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800 group-hover:text-[#0066cc] transition-colors">{landlord?.business_name || 'PropManage Suite'}</span>
                <span className="text-xs text-slate-400 font-medium">{landlord?.phone || user.email}</span>
              </div>
              {landlord?.avatar_url ? (
                <img src={landlord.avatar_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-[#0066cc]">
                  {(landlord?.business_name || 'PM').substring(0, 2).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* CONTAINER (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= SECTION 1: DASHBOARD VIEW ================= */}
          {activeSection === 'dashboard' && (
            <>
              {/* COMBINED STATS & BILLING METRICS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Occupancy & Units */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-blue-50 text-[#0066cc] rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-[#0066cc] text-[10px] font-bold rounded-lg border border-blue-100">
                      {(totalUnits > 0 ? (occupiedUnits/totalUnits)*100 : 0).toFixed(1)}% {lang === 'so' ? 'Degan' : 'Occupied'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalUnits}</span>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalUnits} {lang === 'so' ? 'Qolood' : 'Units'}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {occupiedUnits} {t.unitStatusOccupied.toLowerCase()} • {vacantUnitsCount} {t.unitStatusVacant.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Card 2: Collected Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">Collected</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalPaidAmount}</span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 font-sans flex flex-col">
                      <span>{formatCurrency(paidUSD, 'USD')}</span>
                      {paidSLSH > 0 && <span className="text-[11px] font-bold text-slate-500 leading-none">{formatCurrency(paidSLSH, 'SLSH')}</span>}
                    </h3>
                  </div>
                </div>

                {/* Card 3: Outstanding Rent */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">Pending</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalPendingAmount}</span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 font-sans flex flex-col">
                      <span>{formatCurrency(pendingUSD, 'USD')}</span>
                      {pendingSLSH > 0 && <span className="text-[11px] font-bold text-slate-500 leading-none">{formatCurrency(pendingSLSH, 'SLSH')}</span>}
                    </h3>
                  </div>
                </div>

                {/* Card 4: Overdue Rent */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    {totalOverdueCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-100 animate-pulse">Overdue</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">Clean</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.overdueCount}</span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 font-sans flex flex-col">
                      <span className="text-rose-600 font-extrabold">{totalOverdueCount} {lang === 'so' ? 'Biilood' : 'Invoices'}</span>
                      {totalOverdueCount > 0 && <span className="text-[11px] font-bold text-slate-500 leading-none">{formatCurrency(overdueUSD, 'USD')}</span>}
                    </h3>
                  </div>
                </div>

                {/* Card 5: Total Expenses */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg border border-red-100">Expenses</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'so' ? 'Wadarta Kharashka' : 'Total Expenses'}</span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 font-sans flex flex-col">
                      <span>{formatCurrency(totalExpensesUSD, 'USD')}</span>
                      {totalExpensesSLSH > 0 && <span className="text-[11px] font-bold text-slate-500 leading-none">{formatCurrency(totalExpensesSLSH, 'SLSH')}</span>}
                    </h3>
                  </div>
                </div>

                {/* Card 6: Net Profit */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">Profit</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'so' ? 'Faa\'iidada Saafiga Ah' : 'Net Profit'}</span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-0.5 font-sans flex flex-col">
                      <span className={netProfitUSD < 0 ? 'text-red-600' : 'text-blue-600'}>{formatCurrency(netProfitUSD, 'USD')}</span>
                      {(netProfitSLSH !== 0) && <span className={`text-[11px] font-bold leading-none ${netProfitSLSH < 0 ? 'text-red-500' : 'text-blue-500'}`}>{formatCurrency(netProfitSLSH, 'SLSH')}</span>}
                    </h3>
                  </div>
                </div>
              </section>

              {/* LOWER CARDS */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Add New Tenant Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-5 flex flex-col justify-between min-w-0 w-full">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">{t.addNewTenant}</h4>
                        <p className="text-xs text-slate-400 mt-1">{t.registerLeaseDesc}</p>
                      </div>
                      <button className="p-2 bg-blue-50 text-[#0066cc] rounded-xl">
                        <Users className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateLease} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.fullName}</label>
                          <input 
                            name="name"
                            type="text" 
                            required
                            placeholder="e.g. Axmed Cali" 
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.phoneLabel}</label>
                          <input 
                            name="phone"
                            type="text" 
                            required
                            placeholder="e.g. 63XXXXXXX" 
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                          />
                        </div>
                      </div>

                      {/* GUARANTOR / EMERGENCY CONTACT (DAMIIN) */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div className="col-span-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          Damiinka / Lala Xidhiidhayo (Emergency)
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.emergencyNameLabel}</label>
                          <input 
                            name="emergencyContactName"
                            type="text" 
                            placeholder="Magaca Damiinka" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-300 transition-colors text-slate-800 font-medium placeholder-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.emergencyPhoneLabel}</label>
                          <input 
                            name="emergencyContactPhone"
                            type="text" 
                            placeholder="Telefoonka Damiinka" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-300 transition-colors text-slate-800 font-medium placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.vacantUnit}</label>
                          <select 
                            name="unitId" 
                            required
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                          >
                            <option value="">{t.selectUnit}</option>
                            {vacantUnits.map(unit => (
                              <option key={unit.id} value={unit.id} className="text-slate-800">
                                {properties.find(p => p.id === unit.property_id)?.name || 'Property'} - {unit.unit_number} ({formatCurrency(Number(unit.rent_amount || 0))})
                              </option>
                            ))}
                          </select>
                          {vacantUnitsCount === 0 && (
                            <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                              {t.noVacantUnits}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.leaseStart}</label>
                          <input 
                            name="startDate"
                            type="date" 
                            required
                            className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors mt-2 shadow-sm disabled:bg-slate-300"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.loadingText}</span>
                          </span>
                        ) : (
                          t.createLeaseBtn
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Active Leases & Tenants Overview */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7 flex flex-col justify-between min-w-0 w-full">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">{t.activeLeases}</h4>
                        <p className="text-xs text-slate-400 mt-1">{t.realtimeOccupancy}</p>
                      </div>
                      <button 
                        onClick={() => setActiveSection('tenants')}
                        className="text-xs font-bold text-[#0066cc] hover:underline flex items-center gap-1"
                      >
                        <span>{t.viewAll}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full overflow-x-auto max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      <table className="w-full min-w-full md:min-w-[700px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 pr-4">{t.tenantNameTh}</th>
                            <th className="pb-3 px-4 hidden sm:table-cell">{t.unitTh}</th>
                            <th className="pb-3 px-4 text-right">{t.rentAmountTh}</th>
                            <th className="pb-3 px-4 text-right hidden lg:table-cell">{t.leaseStartTh}</th>
                            <th className="pb-3 pl-4 text-right">{t.actionTh}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {leases.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-sm text-slate-400 font-medium">
                                {t.noActiveTenants}
                              </td>
                            </tr>
                          ) : (
                            leases.slice(0, 5).map((lease, i) => (
                              <tr key={i} className="text-sm hover:bg-slate-50/30 transition-colors">
                                <td className="py-4 pr-4 font-semibold text-slate-700">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                      {(lease.tenants?.name || 'K').substring(0,2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                      <span>{lease.tenants?.name}</span>
                                      <span className="text-[10px] text-slate-400 font-medium">{lease.tenants?.phone}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-slate-500 font-semibold hidden sm:table-cell">{lease.units?.unit_number}</td>
                                <td className="py-4 px-4 font-extrabold text-slate-700 text-right">{formatCurrency(Number(lease.units?.rent_amount || 0))}</td>
                                <td className="py-4 px-4 text-slate-400 font-medium text-right hidden lg:table-cell">{new Date(lease.start_date).toLocaleDateString('en-GB')}</td>
                                <td className="py-4 pl-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handlePrintContract(lease)}
                                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span>Daabac</span>
                                    </button>
                                    <button 
                                      onClick={() => handleTerminateLease(lease.id, lease.unit_id)}
                                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>{t.terminateLeaseBtn}</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ================= SECTION 2: PROPERTIES VIEW ================= */}
          {activeSection === 'properties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{t.propertiesList}</h3>
                  <p className="text-sm text-slate-400 mt-1">Diiwaanka dhismayaasha iyo qolalka ku jira.</p>
                </div>
                <button 
                  onClick={() => setIsPropertyModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addProperty}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                  <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-slate-500 font-bold">Weli wax dhismo ah kuma jiraan.</p>
                  </div>
                ) : (
                  properties.map(property => {
                    const propertyUnits = units.filter(u => u.property_id === property.id)
                    return (
                      <div key={property.id} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 text-[#0066cc] rounded-2xl">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">{propertyUnits.length} Units</span>
                          </div>
                          <div className="mt-4">
                            <h4 className="font-extrabold text-slate-800 text-lg">{property.name}</h4>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{property.address}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                          {propertyUnits.map(unit => (
                            <div key={unit.id} className="flex justify-between items-center text-sm font-semibold bg-slate-50/50 p-2 rounded-xl">
                              <span className="text-slate-700">{unit.unit_number}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-800">{formatCurrency(Number(unit.rent_amount || 0))}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                  unit.status === 'OCCUPIED' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                  {unit.status === 'OCCUPIED' ? t.unitStatusOccupied : t.unitStatusVacant}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION: INVOICES VIEW ================= */}
          {activeSection === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800">{t.invoices}</h3>
                  <p className="text-sm text-slate-400 mt-1">Maamul dhamaan biilasha dhismaha iyo bixintooda.</p>
                </div>
                <button 
                  onClick={handleGenerateInvoices}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:bg-slate-300 self-start sm:self-auto font-sans"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.generateInvoicesBtn}</span>
                </button>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder={lang === 'so' ? "Raadi biilal..." : "Search invoices..."}
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {(['ALL', 'PENDING', 'PAID', 'OVERDUE'] as const).map((filter) => {
                    const count = filter === 'ALL' 
                      ? invoices.length 
                      : invoices.filter(inv => inv.status === filter).length
                    
                    const label = filter === 'ALL' ? (lang === 'so' ? 'Dhamaan' : 'All') :
                                  filter === 'PENDING' ? (t.invoiceStatusPending) :
                                  filter === 'PAID' ? (t.invoiceStatusPaid) :
                                  (t.invoiceStatusOverdue)

                    return (
                      <button
                        key={filter}
                        onClick={() => setInvoiceFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                          invoiceFilter === filter
                            ? 'bg-[#0066cc] text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                          invoiceFilter === filter 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200/60 text-slate-600'
                        }`}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* INVOICES TABLE */}
              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-0 sm:p-6 w-full max-w-full">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full md:min-w-[850px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4 hidden md:table-cell">Invoice ID</th>
                        <th className="pb-3 px-4">{t.tenantNameTh}</th>
                        <th className="pb-3 px-4 hidden sm:table-cell">{t.unitTh}</th>
                        <th className="pb-3 px-4 text-right">{t.amountTh}</th>
                        <th className="pb-3 px-4 text-right hidden lg:table-cell">{t.invoiceDateTh}</th>
                        <th className="pb-3 px-4 text-right hidden md:table-cell">{t.dueDateTh}</th>
                        <th className="pb-3 px-4 text-center">{t.statusTh}</th>
                        <th className="pb-3 pl-4 text-right">{t.actionTh}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-sm text-slate-400 font-medium">
                            {lang === 'so' ? "Ma jiraan biilal laga helay shuruudahan." : "No invoices found for the current criteria."}
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((invoice) => {
                          const isPartial = invoice.amount_paid > 0 && invoice.amount_paid < invoice.amount;
                          
                          // Grace period logic
                          const dueDateObj = new Date(invoice.due_date);
                          const gracePeriodEnd = new Date(dueDateObj);
                          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);
                          const isGracePeriod = invoice.status === 'PENDING' && !isPartial && new Date() <= gracePeriodEnd;

                          const statusColor = invoice.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : isPartial
                            ? 'bg-blue-50 text-[#0066cc] border border-blue-100'
                            : invoice.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                            : isGracePeriod
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'

                          return (
                            <tr key={invoice.id} className="text-sm hover:bg-slate-50/30 transition-colors">
                              <td className="py-4 pr-4 font-mono text-xs text-slate-500 font-bold hidden md:table-cell">
                                #{invoice.id.substring(0, 8).toUpperCase()}
                              </td>
                              <td className="py-4 px-4 font-semibold text-slate-700">
                                {invoice.tenant_name_snapshot}
                              </td>
                              <td className="py-4 px-4 text-slate-500 font-semibold hidden sm:table-cell">
                                {invoice.unit_name_snapshot}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="font-extrabold text-slate-800">
                                  {formatCurrency(invoice.amount, invoice.currency_code)}
                                </div>
                                {isPartial && (
                                  <div className="text-[10px] text-[#0066cc] font-bold mt-0.5 uppercase tracking-wider">
                                    {lang === 'so' ? 'Haraadi:' : 'Bal:'} {formatCurrency(invoice.amount - invoice.amount_paid, invoice.currency_code)}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-medium font-sans text-right hidden lg:table-cell">
                                {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-medium font-sans text-right hidden md:table-cell">
                                {new Date(invoice.due_date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider ${statusColor}`}>
                                  {invoice.status === 'PAID' ? t.invoiceStatusPaid : 
                                   isPartial ? (lang === 'so' ? 'Qayb Bixin' : 'PARTIAL') :
                                   isGracePeriod ? (lang === 'so' ? 'Waqti Baa U Haray' : 'GRACE PERIOD') :
                                   invoice.status === 'OVERDUE' ? t.invoiceStatusOverdue : 
                                   t.invoiceStatusPending}
                                </span>
                              </td>
                              <td className="py-4 pl-4">
                                <div className="flex items-center justify-end gap-2">
                                  {invoice.status !== 'PAID' && (
                                    <div className="flex gap-1">
                                      {invoice.status === 'OVERDUE' && invoice?.leases?.tenants?.phone && (
                                        <a
                                          href={getWhatsAppUrl(
                                            invoice.leases.tenants.phone,
                                            `Kusoo dhawaow ${landlord?.company_name || 'PropManage'}. Waxaan ku xusuusinaynaa in biilkaagii kirada ee ${formatCurrency(invoice.amount, invoice.currency_code)} uu waqtigiisii dhaafay. Fadlan iska soo bixi. Mahadsanid!`
                                          ) || '#'}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={lang === 'so' ? 'Dir Xusuusin WhatsApp ah' : 'Send WhatsApp Reminder'}
                                          className="p-1.5 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-lg transition-all"
                                        >
                                          <MessageSquare className="w-4 h-4" />
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => {
                                          setSelectedInvoiceId(invoice.id)
                                          setPaymentMethod('CASH')
                                          setProviderTransactionId('')
                                          setPaymentAmount((invoice.amount - (invoice.amount_paid || 0)).toString())
                                          setIsPaymentModalOpen(true)
                                        }}
                                        disabled={loading}
                                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                      >
                                        {lang === 'so' ? 'Bixi' : 'Pay'}
                                      </button>
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => handlePrintInvoice(invoice)}
                                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>{t.printInvoiceBtn}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 3: TENANTS VIEW ================= */}
          {activeSection === 'tenants' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">{t.tenants}</h3>
                <p className="text-sm text-slate-400 mt-1">Dhamaan kiraystayaasha heshiiska kula jira.</p>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-0 sm:p-6 w-full max-w-full">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full md:min-w-[850px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4">{t.tenantNameTh}</th>
                        <th className="pb-3 px-4 hidden md:table-cell">{t.phoneLabel}</th>
                        <th className="pb-3 px-4 hidden md:table-cell">{t.emergencyContactTh}</th>
                        <th className="pb-3 px-4">{t.unitTh}</th>
                        <th className="pb-3 px-4 text-right">{t.rentAmountTh}</th>
                        <th className="pb-3 px-4 text-right hidden lg:table-cell">{t.leaseStartTh}</th>
                        <th className="pb-3 pl-4 text-right">{t.actionTh}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leases.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-sm text-slate-400 font-medium">
                            {t.noActiveTenants}
                          </td>
                        </tr>
                      ) : (
                        leases.map((lease, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50/30 transition-colors">
                            <td className="py-4 pr-4 font-semibold text-slate-700">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                  {(lease.tenants?.name || 'K').substring(0,2).toUpperCase()}
                                </div>
                                <span>{lease.tenants?.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-600 hidden md:table-cell">{lease.tenants?.phone}</td>
                            <td className="py-4 px-4 text-slate-500 hidden md:table-cell">
                              {lease.tenants?.emergency_contact_name ? (
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-700">{lease.tenants?.emergency_contact_name}</span>
                                  <span className="text-xs text-slate-400">{lease.tenants?.emergency_contact_phone}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-semibold">{lease.units?.unit_number}</td>
                            <td className="py-4 px-4 font-extrabold text-slate-700 text-right">{formatCurrency(Number(lease.units?.rent_amount || 0))}</td>
                            <td className="py-4 px-4 text-slate-400 font-medium text-right font-sans hidden lg:table-cell">{new Date(lease.start_date).toLocaleDateString('en-GB')}</td>
                            <td className="py-4 pl-4">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    const url = `${window.location.origin}/portal/${lease.tenant_id}?phone=${btoa(lease.tenants?.phone || '')}`
                                    navigator.clipboard.writeText(url)
                                    alert(lang === 'so' ? 'Linkiga Portal-ka waa la koobiyeeyay!' : 'Portal link copied!')
                                  }}
                                  title={lang === 'so' ? 'Koobiyeey Linkiga Portal-ka' : 'Copy Portal Link'}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors border border-slate-200 shadow-sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <a 
                                  href={getWhatsAppUrl(
                                    lease.tenants?.phone || '', 
                                    `Salaamu Calaykum ${lease.tenants?.name.split(' ')[0]},\n\nHalkan ka daawo biilashaada iyo rasiidhadahaaga kirada:\n${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${lease.tenant_id}?phone=${btoa(lease.tenants?.phone || '')}`
                                  ) || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={lang === 'so' ? 'U dir Linkiga WhatsApp' : 'Send Link via WhatsApp'}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-100 shadow-sm"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </a>
                                <button 
                                  onClick={() => handlePrintContract(lease)}
                                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>{lang === 'so' ? 'Daabac' : 'Print'}</span>
                                </button>
                                <button 
                                  onClick={() => handleTerminateLease(lease.id, lease.unit_id)}
                                  className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{t.terminateLeaseBtn}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: PAYMENTS VIEW ================= */}
          {activeSection === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">{t.recordedPayments}</h3>
                <p className="text-sm text-slate-400 mt-1">Lacagaha kirada ee lagula soo diray Zaad, eDahab iyo Cash.</p>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-0 sm:p-6 w-full max-w-full">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full md:min-w-[700px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4">{t.tenantNameTh}</th>
                        <th className="pb-3 px-4 text-right">{t.rentAmountTh}</th>
                        <th className="pb-3 px-4 text-center hidden md:table-cell">{t.paymentMethodTh}</th>
                        <th className="pb-3 px-4 hidden md:table-cell">{t.transactionIdTh}</th>
                        <th className="pb-3 pl-4 text-right">{t.dateTh}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-slate-400 font-medium">
                            {t.noPayments}
                          </td>
                        </tr>
                      ) : (
                        payments.slice().map((payment, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50/30 transition-colors">
                            <td className="py-4 pr-4 font-semibold text-slate-700">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 flex items-center justify-center font-bold text-[#0066cc] text-xs shrink-0">
                                  <DollarSign className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{payment.invoices?.tenant_name_snapshot || 'Tenant'}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">Invoice #{payment.invoice_id?.substring(0, 8).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-extrabold text-emerald-600 text-right">
                              {formatCurrency(Number(payment.amount), payment.currency_code)}
                            </td>
                            <td className="py-4 px-4 text-center hidden md:table-cell">
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
                                payment.payment_method === 'ZAAD' 
                                  ? 'bg-[#E5F5EC] text-[#008A4B] border border-[#CDEBD8]'
                                  : payment.payment_method === 'EDAHAB'
                                  ? 'bg-[#FFF8E6] text-[#D48C00] border border-[#FFEFC2]'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {payment.payment_method}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-slate-500 font-bold hidden md:table-cell">{payment.provider_transaction_id || 'N/A'}</td>
                            <td className="py-4 pl-4 text-slate-400 font-medium text-right font-sans">{new Date(payment.paid_at).toLocaleDateString('en-GB')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 5: EXPENSES SECTION ================= */}
          {activeSection === 'expenses' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 w-full min-w-0 space-y-6">
              <div className="border-b border-slate-100 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-[#0066cc]" />
                      {lang === 'so' ? 'Diiwaanka Kharashaadka' : 'Expenses Registry'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {lang === 'so' ? 'Maamul oo la soco dhammaan kharashyada dhismaha ka baxaya.' : 'Manage and track all property expenses.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">
                {/* Left Side: Expenses Table */}
                <div className="flex-1 w-full min-w-0">
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm w-full">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-3 sm:px-6 py-4">{lang === 'so' ? 'Taariikhda' : 'Date'}</th>
                            <th className="px-3 sm:px-6 py-4">{lang === 'so' ? 'Qaybta' : 'Category'}</th>
                            <th className="px-3 sm:px-6 py-4">{lang === 'so' ? 'Faahfaahin' : 'Description'}</th>
                            <th className="px-3 sm:px-6 py-4">{lang === 'so' ? 'Cadadka' : 'Amount'}</th>
                            <th className="px-3 sm:px-6 py-4 text-right">{lang === 'so' ? 'Tirtir' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                          {expenses.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 sm:px-6 py-12 text-center text-slate-400">
                                <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p>{lang === 'so' ? 'Weli wax kharash ah lama gelinin.' : 'No expenses recorded yet.'}</p>
                              </td>
                            </tr>
                          ) : (
                            expenses.map((expense) => (
                              <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  {new Date(expense.expense_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-3 sm:px-6 py-4">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                    {expense.category}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-4">
                                  <span className="line-clamp-1">{expense.description}</span>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-extrabold text-red-600">
                                  -{formatCurrency(expense.amount, expense.currency_code)}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                                  <form action={async () => {
                                    if(confirm(lang === 'so' ? 'Ma hubtaa inaad tirtirto kharashkan?' : 'Are you sure you want to delete this expense?')) {
                                      const { deleteExpenseAction } = await import('@/app/dashboard/actions');
                                      await deleteExpenseAction(expense.id);
                                    }
                                  }}>
                                    <button type="submit" className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </form>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Side: Add Expense Form */}
                <div className="w-full lg:w-96 shrink-0">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm sticky top-6">
                    <h3 className="font-extrabold text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-[#0066cc]" />
                      {lang === 'so' ? 'Diiwaangeli Kharash Cusub' : 'Add New Expense'}
                    </h3>
                    
                    <form action={async (formData) => {
                      const { addExpenseAction } = await import('@/app/dashboard/actions');
                      const res = await addExpenseAction(
                        Number(formData.get('amount')),
                        formData.get('category') as string,
                        formData.get('description') as string,
                        formData.get('expense_date') as string,
                        formData.get('currency_code') as string
                      );
                      if (res?.error) {
                        alert(lang === 'so' ? 'Cilad: ' + res.error : 'Error: ' + res.error);
                      } else {
                        (document.getElementById('expense-form') as HTMLFormElement).reset();
                      }
                    }} id="expense-form" className="space-y-4">
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'so' ? 'Taariikhda' : 'Date'}
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="date" 
                            name="expense_date"
                            required 
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#0066cc] block pl-10 p-3 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'so' ? 'Qaybta (Category)' : 'Category'}
                        </label>
                        <select 
                          name="category"
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#0066cc] block p-3 transition-all font-medium"
                        >
                          <option value="MAINTENANCE">{lang === 'so' ? 'Dayactir (Maintenance)' : 'Maintenance'}</option>
                          <option value="UTILITIES">{lang === 'so' ? 'Biyaha & Korontada (Utilities)' : 'Utilities'}</option>
                          <option value="SALARY">{lang === 'so' ? 'Mushahaarooyin (Salaries)' : 'Salaries'}</option>
                          <option value="TAXES">{lang === 'so' ? 'Canshuur (Taxes)' : 'Taxes'}</option>
                          <option value="OTHER">{lang === 'so' ? 'Kharash Kale (Other)' : 'Other'}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Lacagta
                          </label>
                          <select 
                            name="currency_code"
                            required
                            defaultValue="USD"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#0066cc] block p-3 font-bold"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="SLSH">SLSH</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {lang === 'so' ? 'Cadadka' : 'Amount'}
                          </label>
                          <input 
                            type="number" 
                            name="amount"
                            required
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#0066cc] block p-3 transition-all font-bold placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {lang === 'so' ? 'Faahfaahin' : 'Description'}
                        </label>
                        <textarea 
                          name="description"
                          required
                          placeholder={lang === 'so' ? 'Faahfaahi kharashkan...' : 'Describe this expense...'}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-[#0066cc] block p-3 transition-all font-medium placeholder:text-slate-300 resize-none"
                        ></textarea>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold rounded-xl text-sm px-5 py-3.5 text-center flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-5 h-5" />
                        {lang === 'so' ? 'Keydi Kharashka' : 'Save Expense'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORTS SECTION */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-slate-400 mt-1">Xogta guud ee maamulka iyo dakhliga ganacsigaaga.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'so' ? 'Soo deji Excel (CSV)' : 'Export to CSV'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.occupancyRate}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-slate-800">
                      {(totalUnits > 0 ? (occupiedUnits/totalUnits)*100 : 0).toFixed(1)}%
                    </span>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${(totalUnits > 0 ? (occupiedUnits/totalUnits)*100 : 0)}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.monthlyRevenue}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-[#0066cc]">{monthlyRevenue}</span>
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Sum of active rent amounts</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.revenueCollected}</h4>
                  <div className="flex flex-col gap-1 justify-center min-h-[40px]">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-emerald-600">
                        {formatCurrency(paidUSD, 'USD')}
                      </span>
                      <Receipt className="w-6 h-6 text-emerald-500" />
                    </div>
                    {paidSLSH > 0 && (
                      <span className="text-sm font-bold text-slate-500">
                        {formatCurrency(paidSLSH, 'SLSH')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium font-sans">Realized mobile money and cash payments</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 6: SETTINGS VIEW ================= */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">{t.settingsTitle}</h3>
                <p className="text-sm text-slate-400 mt-1">{t.settingsDesc}</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {t.businessNameLabel}
                    </label>
                    <input 
                      name="businessName"
                      type="text" 
                      required
                      defaultValue={landlord?.business_name || ''}
                      placeholder="tusaale. AL-Barako Construction" 
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {t.companyPhoneLabel}
                    </label>
                    <input 
                      name="phone"
                      type="text" 
                      required
                      defaultValue={landlord?.phone || ''}
                      placeholder="tusaale. 63XXXXXXX" 
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
                  >
                    {loading ? t.loadingText : t.saveSettingsBtn}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ================= MODALS ================= */}

      {/* 1. PROPERTY MODAL */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-800">{t.savePropertyTitle}</h3>
              <button 
                onClick={() => setIsPropertyModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.propertyName}</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder="e.g. Guryaha VIP" 
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.address}</label>
                <input 
                  name="address"
                  type="text" 
                  required
                  placeholder="e.g. Jigjiga Yar, Hargeisa" 
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingText}</span>
                  </span>
                ) : (
                  t.savePropertyBtn
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. UNIT MODAL */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-800">{t.saveUnitTitle}</h3>
              <button 
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.selectProperty}</label>
                <select 
                  name="propertyId" 
                  required
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                >
                  <option value="">{t.selectProperty}</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.unitNumber}</label>
                <input 
                  name="unitNumber"
                  type="text" 
                  required
                  placeholder={t.unitPlaceholder}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.rentAmount}</label>
                <input 
                  name="rentAmount"
                  type="number" 
                  required
                  placeholder="e.g. 350" 
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingText}</span>
                  </span>
                ) : (
                  t.saveUnitBtn
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* 3. PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-800">
                {lang === 'so' ? 'Diiwangkali Lacag Bixinta' : 'Record Rent Payment'}
              </h3>
              <button 
                onClick={() => {
                  setIsPaymentModalOpen(false)
                  setSelectedInvoiceId(null)
                }}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 -mt-2">
              {lang === 'so' 
                ? 'Dooro habka lacagta loo bixiyey oo geli faahfaahinta si aad u xaqiijiso biilkan.' 
                : 'Select how the payment was made and enter the transaction reference.'}
            </p>
            
            <form onSubmit={handlePayInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {lang === 'so' ? 'Habka Lacag Bixinta' : 'Payment Method'}
                </label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  required
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                >
                  <option value="CASH">{lang === 'so' ? 'Cash (Lacag Gacmeed)' : 'Cash'}</option>
                  <option value="ZAAD">ZAAD Services</option>
                  <option value="EDAHAB">e-Dahab Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {lang === 'so' ? 'Qadarka La Bixinayo ($)' : 'Payment Amount ($)'}
                </label>
                <input 
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {lang === 'so' ? 'Tixraaca Lacagta (Txn ID / Ref)' : 'Transaction ID / Reference'}
                </label>
                <input 
                  value={providerTransactionId}
                  onChange={(e) => setProviderTransactionId(e.target.value)}
                  type="text" 
                  placeholder={paymentMethod === 'CASH' ? 'Optional (e.g. CASH-1234)' : 'e.g. 62719401'}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium placeholder-slate-400"
                />
                {paymentMethod !== 'CASH' && (
                  <span className="text-[10px] text-[#0066cc] font-medium mt-1 block">
                    {lang === 'so' 
                      ? 'Geli lambarka tixraaca ee SMS-ka ku soo dhacay si aad hadhow ugu raad-raacdo.' 
                      : 'Enter the transaction ID from the mobile money SMS receipt.'}
                  </span>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingText}</span>
                  </span>
                ) : (
                  lang === 'so' ? 'Xaqiiji Lacagta' : 'Confirm & Record Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. HELP & AI SUPPORT CENTER MODAL */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full flex flex-col h-[85vh] max-h-[700px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066cc]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {lang === 'so' ? 'Xarunta Caawimada & AI' : 'Help & AI Support Center'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {lang === 'so' ? 'Baro sida nidaamku u shaqeeyo ama la xiriir caawimada' : 'Learn how the system works or contact support'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: AI Assistant Chat */}
              <div className="flex-1 flex flex-col bg-slate-50/50 border-r border-slate-100 overflow-hidden">
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'so' ? 'Caawiyaha AI ee PropManage' : 'PropManage AI Assistant'}
                    </span>
                  </div>
                  <button
                    onClick={() => setChatMessages([
                      {
                        sender: 'ai',
                        text: lang === 'so' 
                          ? "Salaan! Waxaan ahay Caawiyahaaga AI ee PropManage. Waxaan kugu caawin karaa inaad fahamto sida nidaamku u shaqeeyo bilow ilaa dhammaad. Fadlan guji mid ka mid ah su'aalaha diyaarka ah ee hoose ama ii soo qor su'aashaada!"
                          : "Hello! I am your PropManage AI Assistant. I can help you understand how the system works from start to finish. Please click one of the quick questions below or type your message!"
                      }
                    ])}
                    className="text-[10px] font-bold text-[#0066cc] hover:underline"
                  >
                    {lang === 'so' ? 'Nadiifi Wada-hadalka' : 'Clear Chat'}
                  </button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#0066cc] text-white rounded-br-none'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none font-medium'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Preset Help Buttons / Quick Questions */}
                <div className="p-3 bg-white border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                    {lang === 'so' ? "Su'aalaha Caanka ah / Quick Topics:" : 'Common Questions / Quick Topics:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pb-1">
                    {helpTopics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleQuickQuestion(topic.id)}
                        className="text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-[#0066cc] text-slate-600 font-semibold rounded-lg border border-slate-100 transition-colors"
                      >
                        {lang === 'so' ? topic.titleSo.split(' ')[0] + ' ' + topic.titleSo.substring(topic.titleSo.indexOf(' ') + 1) : topic.titleEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendHelpMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={lang === 'so' ? "Igu qor su'aal ku saabsan nidaamka..." : "Ask a question about the system..."}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 focus:bg-white transition-all text-slate-800 font-medium placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-[#0066cc] hover:bg-[#0055b3] text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Column: Contact & Support Links */}
              <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-white overflow-y-auto border-l border-slate-100">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                      {lang === 'so' ? 'Wada-hadal Toos ah' : 'Direct Support'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      {lang === 'so' 
                        ? 'Haddii aad rabto caawimo bini-aadam ama aad su’aal toos ah qabto, guji badhanka hoose si aad ula xiriirto WhatsApp-ka Maamulaha.'
                        : 'If you need human assistance or have direct questions, click the button below to reach the Administrator on WhatsApp.'}
                    </p>

                    {landlord?.phone ? (
                      <a
                        href={getWhatsAppUrl(landlord.phone, 'Ku saabsan PropManage: Hello, waxaan u baahanahay caawimo ku saabsan nidaamka maamulka kirada.') || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm transform hover:-translate-y-0.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{lang === 'so' ? 'WhatsApp-ka Maamulaha' : 'WhatsApp Owner'}</span>
                      </a>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                          ⚠️ {lang === 'so' 
                            ? 'Lambar taleefan kuma jiro Settings-kaaga. Fadlan ku dar taleefan profile-kaaga si badhankan WhatsApp-ku u shaqeeyo!' 
                            : 'No contact phone number is set in Settings. Please add a phone number to enable the WhatsApp support link!'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                      {lang === 'so' ? 'Taageerada Farsamada' : 'Technical Support'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      {lang === 'so'
                        ? 'Haddii aad isbeddel ku samaynayso nidaamka, ama aad aragto cilad farsamo oo u baahan caawinta horumariyaha:'
                        : 'If you want adjustments to the system, or run into technical issues that need developer attention:'}
                    </p>
                    <a
                      href="https://wa.me/252634621940?text=PropManage%20Support%3A%20Hello%20sxb%20waxaan%20u%20baahanahay%20caawimo%20farsamo."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-100 transition-all text-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
                      <span>{lang === 'so' ? 'La Xiriir Horumariyaha' : 'Contact Developer'}</span>
                    </a>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold text-center leading-relaxed">
                    PropManage System v1.1.0<br/>
                    {lang === 'so' ? 'Xuquuqda waa la dhowray' : 'All Rights Reserved'} &copy; {new Date().getFullYear()}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-800">{lang === 'so' ? 'Beddel Magaca & Sawirka' : 'Edit Profile'}</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <label className="cursor-pointer group relative">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-slate-50 shadow-sm group-hover:bg-blue-100 transition-colors">
                      <span className="text-3xl font-bold text-[#0066cc]">{(landlord?.business_name || 'PM').substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">{lang === 'so' ? 'Beddel' : 'Change'}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <p className="text-xs text-slate-400 font-medium">{lang === 'so' ? 'Taabo sawirka si aad u beddesho' : 'Tap image to change'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'so' ? 'Magaca Shirkadda' : 'Business Name'}</label>
                <input 
                  name="businessName"
                  type="text" 
                  required
                  defaultValue={landlord?.business_name}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === 'so' ? 'Lambarka Telefoonka' : 'Phone Number'}</label>
                <input 
                  name="phone"
                  type="text" 
                  required
                  defaultValue={landlord?.phone || ''}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-slate-200 transition-colors text-slate-800 font-medium"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:bg-slate-300"
              >
                {loading ? (lang === 'so' ? 'Waa la kaydinayaa...' : 'Saving...') : (lang === 'so' ? 'Kaydi Isbeddelka' : 'Save Changes')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
