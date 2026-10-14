'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertCircle,
  ArrowLeft,
  Save,
  Send,
  Eye,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Activity,
  Stethoscope,
  TestTube2,
  Radiation,
} from 'lucide-react';
import Link from 'next/link';

interface ReportFormProps {
  initialReport?: any;
  preselectedPatientId?: string;
  isEdit?: boolean;
}

export function ReportForm({
  initialReport,
  preselectedPatientId,
  isEdit = false,
}: ReportFormProps) {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialReport?.patientId || preselectedPatientId || '',
  );
  const [template, setTemplate] = useState<any>(null);
  const [registeredAt, setRegisteredAt] = useState(
    initialReport?.registeredAt || new Date().toISOString().split('T')[0],
  );

  // Examination & Lab Data
  const [reportData, setReportData] = useState<Record<string, any>>({
    // Medical Examination Defaults
    eye_visual_acuity_r: '6/6',
    eye_visual_acuity_l: '6/6',
    ear_r: 'NAD',
    ear_l: 'NAD',
    blood_pressure: '120/80',
    heart: 'NAD',
    lungs: 'NAD',
    abdomen: 'NAD',
    hernia: 'ABSENT',
    varicose_veins: 'ABSENT',
    deformities: 'ABSENT',
    skin: 'NAD',
    cns: 'NAD',
    extremities: 'NAD',
    psychiatry: 'NAD',
    venereal_symptoms: 'NAD',
    exam_remarks: 'NORMAL',

    // Laboratory Investigation Defaults
    urine_sugar_albumin: 'NIL - NIL',
    urine_opiates_cannabis: 'N/A - N/A - N/A',
    urine_pregnancy: 'N/A',
    blood_group: 'B (+VE)',
    haemoglobin: '14.2',
    esr: '12',
    rbs: '5.8',
    s_creatinine: '1.0',
    s_bil: '0.85',
    sgpt: '35',
    sgot: '28',
    hiv: 'NEGATIVE',
    hbsag: 'NEGATIVE',
    anti_hcv: 'NEGATIVE',
    tpha: 'NEGATIVE',
    vdrl: 'NON REACTIVE',
    lab_remarks: 'NORMAL',

    // Overwrite with initial values if editing
    ...(initialReport?.reportData || {}),
  });

  const [xrayFinding, setXrayFinding] = useState(initialReport?.xrayFinding || 'NORMAL');
  const [xrayRemarks, setXrayRemarks] = useState(initialReport?.xrayRemarks || 'NORMAL');
  const [xrayImageUrl, setXrayImageUrl] = useState<string>(initialReport?.xrayImageUrl || '');
  const [xrayPreview, setXrayPreview] = useState<string>(initialReport?.xrayImageUrl || '');
  const [uploadingXray, setUploadingXray] = useState(false);
  const [uploadXrayError, setUploadXrayError] = useState<string | null>(null);
  const xrayFileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleXrayFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadXrayError(null);
    setUploadingXray(true);

    const localUrl = URL.createObjectURL(file);
    setXrayPreview(localUrl);

    try {
      const res = await api.uploadFile(file);
      setXrayImageUrl(res.url);
      setXrayPreview(res.url);
    } catch (err: any) {
      setUploadXrayError(err.message || 'Failed to upload X-ray image');
    } finally {
      setUploadingXray(false);
    }
  };

  const handleRemoveXray = () => {
    setXrayImageUrl('');
    setXrayPreview('');
    if (xrayFileInputRef.current) {
      xrayFileInputRef.current.value = '';
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [patRes, tplRes] = await Promise.all([
          api.get<any>('/patients', { limit: 100 }),
          api.get<any>('/templates/active'),
        ]);
        setPatients(patRes.data || []);
        setTemplate(tplRes);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  const handleFieldChange = (key: string, value: any) => {
    setReportData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (submitForReview = false) => {
    if (!selectedPatientId) {
      setError('Please select a candidate before saving the report');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let reportId = initialReport?.id;

      if (!isEdit) {
        const payload = {
          patientId: selectedPatientId,
          templateVersionId: template?.activeVersion?.id,
          registeredAt,
          reportData,
          xrayFinding,
          xrayRemarks,
          xrayImageUrl: xrayImageUrl || undefined,
        };
        const created = await api.post<any>('/reports', payload);
        reportId = created.id;
      } else {
        const payload = {
          registeredAt,
          reportData,
          xrayFinding,
          xrayRemarks,
          xrayImageUrl: xrayImageUrl || undefined,
        };
        await api.patch(`/reports/${reportId}`, payload);
      }

      if (submitForReview && reportId) {
        await api.post(`/reports/${reportId}/submit`);
      }

      router.push(`/reports/${reportId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save medical report');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header */}
      <PageHeader
        title={isEdit ? `Edit Report Draft: ${initialReport?.registrationNumber}` : 'New Medical Examination Report'}
        description="Comprehensive clinical findings, laboratory serology, and pulmonary chest radiography."
        backHref={isEdit && initialReport?.id ? `/reports/${initialReport.id}` : '/reports'}
        backLabel="Back to reports"
      />

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeInFast shadow-2xs"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* 1. Candidate Selection & Date Header */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="py-3.5 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Candidate & Examination Date
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Link this medical report to an authenticated candidate profile.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Candidate Selection <span className="text-rose-500">*</span>
            </label>
            {isEdit || preselectedPatientId ? (
              <div className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-900">
                <span className="uppercase">
                  {initialReport?.patient?.fullName || selectedPatient?.fullName || 'Selected Candidate'}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {initialReport?.patient?.passportNumber || selectedPatient?.passportNumber}
                </span>
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Choose Candidate --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.passportNumber}) — {p.country}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Examination Date <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              value={registeredAt}
              onChange={(e) => setRegisteredAt(e.target.value)}
              className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Side-by-Side Clinical Examination & Laboratory Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Medical Examination */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="py-3 px-4 sm:px-6 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Medical Physical Examination
              </CardTitle>
            </div>
            <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full font-mono font-bold">15 Tests</span>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5 flex-1">
            {/* Eye Acuity */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Eye Visual Acuity
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Right (e.g. 6/6)"
                  value={reportData.eye_visual_acuity_r}
                  onChange={(e) => handleFieldChange('eye_visual_acuity_r', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
                <Input
                  placeholder="Left (e.g. 6/6)"
                  value={reportData.eye_visual_acuity_l}
                  onChange={(e) => handleFieldChange('eye_visual_acuity_l', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Ear */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Ear Hearing Assessment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Right (e.g. NAD)"
                  value={reportData.ear_r}
                  onChange={(e) => handleFieldChange('ear_r', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
                <Input
                  placeholder="Left (e.g. NAD)"
                  value={reportData.ear_l}
                  onChange={(e) => handleFieldChange('ear_l', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Cardiovascular */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Blood Pressure (B.P)
                </label>
                <Input
                  placeholder="120/80"
                  value={reportData.blood_pressure}
                  onChange={(e) => handleFieldChange('blood_pressure', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Heart
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.heart}
                  onChange={(e) => handleFieldChange('heart', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Respiratory & Abdomen */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Lungs
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.lungs}
                  onChange={(e) => handleFieldChange('lungs', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Abdomen
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.abdomen}
                  onChange={(e) => handleFieldChange('abdomen', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Surgical / Physical Findings */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Hernia
                </label>
                <Input
                  placeholder="ABSENT"
                  value={reportData.hernia}
                  onChange={(e) => handleFieldChange('hernia', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Varicose Veins
                </label>
                <Input
                  placeholder="ABSENT"
                  value={reportData.varicose_veins}
                  onChange={(e) => handleFieldChange('varicose_veins', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Deformities
                </label>
                <Input
                  placeholder="ABSENT"
                  value={reportData.deformities}
                  onChange={(e) => handleFieldChange('deformities', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Systemic */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Skin Condition
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.skin}
                  onChange={(e) => handleFieldChange('skin', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  C.N.S
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.cns}
                  onChange={(e) => handleFieldChange('cns', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Extremities
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.extremities}
                  onChange={(e) => handleFieldChange('extremities', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Psychiatry
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.psychiatry}
                  onChange={(e) => handleFieldChange('psychiatry', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Venereal Symptoms
                </label>
                <Input
                  placeholder="NAD"
                  value={reportData.venereal_symptoms}
                  onChange={(e) => handleFieldChange('venereal_symptoms', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Physical Exam Remarks
                </label>
                <Input
                  placeholder="NORMAL"
                  value={reportData.exam_remarks}
                  onChange={(e) => handleFieldChange('exam_remarks', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Laboratory Investigations */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="py-3 px-4 sm:px-6 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4 text-teal-600" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Laboratory Investigations
              </CardTitle>
            </div>
            <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full font-mono font-bold">16 Panels</span>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5 flex-1">
            {/* Urine Panel */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Urine for Sugar - Albumin
              </label>
              <Input
                placeholder="NIL - NIL"
                value={reportData.urine_sugar_albumin}
                onChange={(e) => handleFieldChange('urine_sugar_albumin', e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Urine Opiates - Cannabis
                </label>
                <Input
                  placeholder="N/A - N/A - N/A"
                  value={reportData.urine_opiates_cannabis}
                  onChange={(e) => handleFieldChange('urine_opiates_cannabis', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Urine Pregnancy
                </label>
                <Input
                  placeholder="N/A"
                  value={reportData.urine_pregnancy}
                  onChange={(e) => handleFieldChange('urine_pregnancy', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Blood Hematology */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Blood Group
                </label>
                <Input
                  placeholder="B (+VE)"
                  value={reportData.blood_group}
                  onChange={(e) => handleFieldChange('blood_group', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Haemoglobin (g/dL)
                </label>
                <Input
                  placeholder="14.2"
                  value={reportData.haemoglobin}
                  onChange={(e) => handleFieldChange('haemoglobin', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  E.S.R (mm/hr)
                </label>
                <Input
                  placeholder="12"
                  value={reportData.esr}
                  onChange={(e) => handleFieldChange('esr', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Clinical Biochemistry */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  R.B.S (mmol/L)
                </label>
                <Input
                  placeholder="5.8"
                  value={reportData.rbs}
                  onChange={(e) => handleFieldChange('rbs', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  S. Creatinine
                </label>
                <Input
                  placeholder="1.0"
                  value={reportData.s_creatinine}
                  onChange={(e) => handleFieldChange('s_creatinine', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  S. Bilirubin
                </label>
                <Input
                  placeholder="0.85"
                  value={reportData.s_bil}
                  onChange={(e) => handleFieldChange('s_bil', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Liver Function */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  SGPT (U/L)
                </label>
                <Input
                  placeholder="35"
                  value={reportData.sgpt}
                  onChange={(e) => handleFieldChange('sgpt', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  SGOT (U/L)
                </label>
                <Input
                  placeholder="28"
                  value={reportData.sgot}
                  onChange={(e) => handleFieldChange('sgot', e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Infectious Disease Serology */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  HIV I & II
                </label>
                <select
                  value={reportData.hiv}
                  onChange={(e) => handleFieldChange('hiv', e.target.value)}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  HBsAg
                </label>
                <select
                  value={reportData.hbsag}
                  onChange={(e) => handleFieldChange('hbsag', e.target.value)}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Anti HCV
                </label>
                <select
                  value={reportData.anti_hcv}
                  onChange={(e) => handleFieldChange('anti_hcv', e.target.value)}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  VDRL (Syphilis)
                </label>
                <select
                  value={reportData.vdrl}
                  onChange={(e) => handleFieldChange('vdrl', e.target.value)}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="NON REACTIVE">NON REACTIVE</option>
                  <option value="REACTIVE">REACTIVE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  TPHA
                </label>
                <select
                  value={reportData.tpha}
                  onChange={(e) => handleFieldChange('tpha', e.target.value)}
                  className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Laboratory Remarks
              </label>
              <Input
                placeholder="NORMAL"
                value={reportData.lab_remarks}
                onChange={(e) => handleFieldChange('lab_remarks', e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Pulmonary Radiology (Chest X-Ray) */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="py-3.5 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radiation className="h-4 w-4 text-teal-600" />
              <span>Pulmonary Radiology (Chest X-Ray)</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Radiological evaluation for tuberculosis and lung pathology.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Chest X-Ray Finding
              </label>
              <Input
                placeholder="NORMAL"
                value={xrayFinding}
                onChange={(e) => setXrayFinding(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Radiology Remarks
              </label>
              <Input
                placeholder="NORMAL"
                value={xrayRemarks}
                onChange={(e) => setXrayRemarks(e.target.value)}
                className="h-10 text-xs rounded-xl font-bold text-red-600"
              />
            </div>
          </div>

          {/* Radiograph Upload Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Chest Radiograph Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-32 rounded-xl border border-slate-300 bg-slate-900 flex items-center justify-center overflow-hidden relative shadow-2xs flex-shrink-0">
                {xrayPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getFullImageUrl(xrayPreview)}
                      alt="Chest X-Ray"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveXray}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-600" />
                )}

                {uploadingXray && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-teal-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  ref={xrayFileInputRef}
                  onChange={handleXrayFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingXray}
                  onClick={() => xrayFileInputRef.current?.click()}
                  className="text-xs rounded-lg"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  <span>{xrayPreview ? 'Replace Radiograph' : 'Upload X-Ray'}</span>
                </Button>
                <p className="text-[10px] text-slate-400">
                  Optional. Defaults to official chest radiograph asset if omitted.
                </p>
                {uploadXrayError && (
                  <p className="text-[11px] text-rose-600 font-medium">{uploadXrayError}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Bottom Actions Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-float flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          Values persist to PostgreSQL. Final medical fitness is evaluated during doctor sign-off.
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="h-9 px-4 text-xs rounded-xl border-slate-200 hover:border-slate-300 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="h-9 px-4 text-xs rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs gap-1.5 w-full sm:w-auto active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
            <span>Submit for Review</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
