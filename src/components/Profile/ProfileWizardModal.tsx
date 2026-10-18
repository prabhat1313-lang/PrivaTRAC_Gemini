import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { UserProfileDetails } from '../../types/crm';
import {
  User,
  Shield,
  CheckCircle2,
  Globe,
  Coins,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Building2,
  Lock,
  Bell,
  Sliders,
  Check,
} from 'lucide-react';

interface ProfileWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const ProfileWizardModal: React.FC<ProfileWizardModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { currentUser, setCurrentUser, users } = useCrm();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Identity & Persona
  const [name, setName] = useState(currentUser.name);
  const [designation, setDesignation] = useState(
    currentUser.profileDetails?.designation ||
      (currentUser.role === 'Sales Owner'
        ? 'Senior Enterprise Sales Director'
        : currentUser.role === 'Pre-Sales Owner'
        ? 'Principal Solutions Architect'
        : 'Enterprise SalesOps Lead')
  );
  const [department, setDepartment] = useState(
    currentUser.profileDetails?.department || 'Strategic Enterprise Accounts'
  );

  // Step 2: Territory & Products
  const [primaryTerritory, setPrimaryTerritory] = useState(
    currentUser.profileDetails?.primaryTerritory || 'India (North & West)'
  );
  const [productSpecializations, setProductSpecializations] = useState<string[]>(
    currentUser.profileDetails?.productSpecializations || [
      'PETs Core (zk-SNARKs & Privacy Engine)',
      'PrivaSapien Synthetic Data Studio',
    ]
  );

  // Step 3: Currency & Numbering
  const [defaultCurrency, setDefaultCurrency] = useState<'INR' | 'USD' | 'SGD' | 'EUR' | 'GBP'>(
    currentUser.profileDetails?.defaultCurrency || 'INR'
  );
  const [useIndianNumbering, setUseIndianNumbering] = useState<boolean>(
    currentUser.profileDetails?.useIndianNumbering !== undefined
      ? currentUser.profileDetails.useIndianNumbering
      : true
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    currentUser.profileDetails?.notificationsEnabled !== undefined
      ? currentUser.profileDetails.notificationsEnabled
      : true
  );

  // Step 4: PrivaTRAC Delegation & Governance
  const [delegationAuthorized, setDelegationAuthorized] = useState<boolean>(
    currentUser.profileDetails?.delegationAuthorized !== undefined
      ? currentUser.profileDetails.delegationAuthorized
      : true
  );
  const [delegatedProxyUser, setDelegatedProxyUser] = useState<string>(
    currentUser.profileDetails?.delegatedProxyUser || 'Kavita Rao'
  );

  if (!isOpen) return null;

  const toggleProduct = (prod: string) => {
    setProductSpecializations((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  };

  const handleSaveAndComplete = () => {
    const updatedDetails: UserProfileDetails = {
      designation,
      department,
      primaryTerritory,
      productSpecializations,
      defaultCurrency,
      useIndianNumbering,
      delegationAuthorized,
      delegatedProxyUser,
      notificationsEnabled,
      profileCompletionPercentage: 100,
      completedAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...currentUser,
      name,
      profileCompleted: true,
      profileDetails: updatedDetails,
    };

    setCurrentUser(updatedUser);
    if (onCompleted) onCompleted();
    onClose();
  };

  const calculateCompletionPercentage = () => {
    let score = 25; // Base Identity
    if (designation && department) score += 25;
    if (productSpecializations.length > 0) score += 25;
    if (delegationAuthorized) score += 25;
    return score;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Guided Operational Profile Setup
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure your operator identity, regional preferences, and PrivaTRAC governance defaults.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">
              {currentStep === 1 && '1. Identity & Corporate Designation'}
              {currentStep === 2 && '2. Territory & Product Focus'}
              {currentStep === 3 && '3. Currency & Numbering Standards'}
              {currentStep === 4 && '4. PrivaTRAC Delegation & Governance'}
            </span>
            <span className="font-bold text-indigo-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard Body by Step */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-5 text-xs text-slate-800">
          {/* STEP 1: IDENTITY & ROLE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-2.5 text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <p className="leading-relaxed">
                  Your identity defines your signature across RFP bid desks, client meetings, and audit logs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Credentials
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900 font-medium"
                  placeholder="e.g. Vikram Malhotra"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900 font-medium"
                  placeholder="e.g. Senior Enterprise Sales Director"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Division
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
                  >
                    <option value="Strategic Enterprise Accounts">Strategic Enterprise Accounts</option>
                    <option value="BFSI Sector Practice">BFSI Sector Practice</option>
                    <option value="Healthcare & Genomics Practice">Healthcare & Genomics Practice</option>
                    <option value="Pre-Sales & Bid Architecture">Pre-Sales & Bid Architecture</option>
                    <option value="Security & Compliance Office">Security & Compliance Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role & Permissions
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.role} (PrivaTRAC Certified)`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TERRITORY & PRODUCT FOCUS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-700">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <p>
                  Targeting sets your default pipeline view, currency conversions, and relevant RFP corrigenda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Sales Geography
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'India (North & West)',
                    'India (South & East)',
                    'Singapore & APAC',
                    'United Kingdom & Europe',
                    'North America',
                    'Global Strategic Alliances',
                  ].map((terr) => (
                    <button
                      key={terr}
                      type="button"
                      onClick={() => setPrimaryTerritory(terr)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        primaryTerritory === terr
                          ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{terr}</span>
                      {primaryTerritory === terr && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PrivaSapien Product Specializations (Select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    {
                      name: 'PETs Core (zk-SNARKs & Privacy Engine)',
                      desc: 'Elliptic curve zero-knowledge proofs for data clean rooms',
                    },
                    {
                      name: 'PrivaSapien Synthetic Data Studio',
                      desc: 'HIPAA & ISO 42001 compliant patient & financial records',
                    },
                    {
                      name: 'Differential Privacy Sandbox (ε, δ)',
                      desc: 'Mathematical privacy loss budgeting & benchmark telemetry',
                    },
                    {
                      name: 'Regulatory Compliance & Audits (DPDP/MAS/ISO)',
                      desc: 'Attestation packs for Indian DPDP Act, MAS FEAT, and FIPS 140-3',
                    },
                  ].map((prod) => {
                    const isChecked = productSpecializations.includes(prod.name);
                    return (
                      <div
                        key={prod.name}
                        onClick={() => toggleProduct(prod.name)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'border-indigo-500 bg-indigo-50/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{prod.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CURRENCY & NUMBERING STANDARDS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-700">
                <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                <p>
                  Set your primary reporting currency and Indian numbering system format (₹ Crores & Lakhs).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Currency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'INR' as const, label: 'INR (₹)', sub: 'Indian Rupee' },
                    { code: 'USD' as const, label: 'USD ($)', sub: 'US Dollar' },
                    { code: 'SGD' as const, label: 'SGD (S$)', sub: 'Singapore Dollar' },
                    { code: 'EUR' as const, label: 'EUR (€)', sub: 'Euro' },
                    { code: 'GBP' as const, label: 'GBP (£)', sub: 'British Pound' },
                  ].map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setDefaultCurrency(curr.code)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        defaultCurrency === curr.code
                          ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-950 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-sm">{curr.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">{curr.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Indian Numbering Format (₹ Crores & Lakhs)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Formats ₹12,50,00,000 as ₹12.5 Cr rather than 125M
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useIndianNumbering}
                    onChange={(e) => setUseIndianNumbering(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Tender & RFP Deadline Notifications</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Receive notifications for pre-bid queries, conferences, and tender cutoffs
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRIVATRAC DELEGATION & GOVERNANCE */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>PrivaTRAC Enterprise Security Rule:</strong> All changes performed on your behalf by
                  SalesOps Copilot or designated colleagues log immutable before/after diffs with your operator
                  attribution.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Authorize 'On Behalf Of' Delegation
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Permits designated team leads to stage operational updates during your absence
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={delegationAuthorized}
                    onChange={(e) => setDelegationAuthorized(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {delegationAuthorized && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Designated Proxy User
                    </label>
                    <select
                      value={delegatedProxyUser}
                      onChange={(e) => setDelegatedProxyUser(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
                    >
                      {users
                        .filter((u) => u.name !== currentUser.name)
                        .map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Profile Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Profile Summary Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    Operator: <strong className="text-slate-900">{name}</strong>
                  </div>
                  <div>
                    Designation: <strong className="text-slate-900">{designation}</strong>
                  </div>
                  <div>
                    Territory: <strong className="text-slate-900">{primaryTerritory}</strong>
                  </div>
                  <div>
                    Default Currency: <strong className="text-slate-900">{defaultCurrency}</strong>
                  </div>
                  <div className="col-span-2">
                    Specializations:{' '}
                    <strong className="text-slate-900">
                      {productSpecializations.length} Products Selected
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Set Up Later
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndComplete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Complete Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
