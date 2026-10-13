'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Save, Send, Eye, Upload, Trash2, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
      setError('Please select a patient before saving the report');
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
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Link href={isEdit && initialReport ? `/reports/${initialReport.id}` : '/reports'}>
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Submit for Review</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Patient & Registration Header */}
      <Card className="bg-white">
        <CardHeader className="py-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Registration & Patient Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Select Patient *
              </label>
              {isEdit ? (
                <div className="h-8 flex items-center px-2.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium">
                  {initialReport?.patient?.fullName} ({initialReport?.patient?.passportNumber})
                </div>
              ) : (
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — {p.passportNumber} ({p.country})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Registration Date *
              </label>
              <Input
                type="date"
                value={registeredAt}
                onChange={(e) => setRegisteredAt(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Issuing Protocol
              </label>
              <div className="h-8 flex items-center px-2.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 font-mono">
                {template?.template?.code || 'STANDARD_MMS_V1'}
              </div>
            </div>
          </div>

          {selectedPatient && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">PASSPORT NO</span>
                <span className="font-mono font-semibold text-slate-800">{selectedPatient.passportNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">COUNTRY</span>
                <span className="font-semibold text-slate-800">{selectedPatient.country}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">GENDER / DOB</span>
                <span className="text-slate-800">{selectedPatient.gender} • {selectedPatient.dateOfBirth?.split('T')[0]}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">AGENCY</span>
                <span className="text-slate-800">{selectedPatient.agency || '—'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Clinical Grid: Medical Exam & Lab Investigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Medical Examination */}
        <Card className="bg-white">
          <CardHeader className="py-2.5 bg-slate-900 text-white rounded-t">
            <CardTitle className="text-xs uppercase tracking-wider text-white font-semibold">
              Medical Examination
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {/* Eye Visual Acuity */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Eye Visual Acuity</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Right Eye (R)</span>
                  <Input
                    value={reportData.eye_visual_acuity_r}
                    onChange={(e) => handleFieldChange('eye_visual_acuity_r', e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Left Eye (L)</span>
                  <Input
                    value={reportData.eye_visual_acuity_l}
                    onChange={(e) => handleFieldChange('eye_visual_acuity_l', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ear */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Ear Examination</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Right Ear (R)</span>
                  <Input
                    value={reportData.ear_r}
                    onChange={(e) => handleFieldChange('ear_r', e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Left Ear (L)</span>
                  <Input
                    value={reportData.ear_l}
                    onChange={(e) => handleFieldChange('ear_l', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cardio & Respiratory */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">B.P (mm Hg) *</label>
                <Input
                  value={reportData.blood_pressure}
                  onChange={(e) => handleFieldChange('blood_pressure', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Heart</label>
                <Input
                  value={reportData.heart}
                  onChange={(e) => handleFieldChange('heart', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Lungs</label>
                <Input
                  value={reportData.lungs}
                  onChange={(e) => handleFieldChange('lungs', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Abdomen</label>
                <Input
                  value={reportData.abdomen}
                  onChange={(e) => handleFieldChange('abdomen', e.target.value)}
                />
              </div>
            </div>

            {/* Surgical & Physical Findings */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Hernia</label>
                <select
                  value={reportData.hernia}
                  onChange={(e) => handleFieldChange('hernia', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="ABSENT">ABSENT</option>
                  <option value="PRESENT">PRESENT</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Varicose Veins</label>
                <select
                  value={reportData.varicose_veins}
                  onChange={(e) => handleFieldChange('varicose_veins', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="ABSENT">ABSENT</option>
                  <option value="PRESENT">PRESENT</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Deformities</label>
                <select
                  value={reportData.deformities}
                  onChange={(e) => handleFieldChange('deformities', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="ABSENT">ABSENT</option>
                  <option value="PRESENT">PRESENT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Skin</label>
                <Input
                  value={reportData.skin}
                  onChange={(e) => handleFieldChange('skin', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">C.N.S</label>
                <Input
                  value={reportData.cns}
                  onChange={(e) => handleFieldChange('cns', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Extremities</label>
                <Input
                  value={reportData.extremities}
                  onChange={(e) => handleFieldChange('extremities', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Psychiatry</label>
                <Input
                  value={reportData.psychiatry}
                  onChange={(e) => handleFieldChange('psychiatry', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Venereal Symptoms</label>
                <Input
                  value={reportData.venereal_symptoms}
                  onChange={(e) => handleFieldChange('venereal_symptoms', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Exam Remarks</label>
                <Input
                  value={reportData.exam_remarks}
                  onChange={(e) => handleFieldChange('exam_remarks', e.target.value)}
                />
              </div>
            </div>

            {/* X-Ray Section */}
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase block">
                  Radiological Examination (Chest X-Ray)
                </span>
                {xrayImageUrl && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Image Attached
                  </span>
                )}
              </div>

              {/* X-Ray Radiograph Upload Card */}
              <div className="p-2.5 bg-white rounded border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-20 h-24 rounded border border-slate-300 bg-slate-950 overflow-hidden flex items-center justify-center shadow-inner flex-shrink-0">
                  {xrayPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getFullImageUrl(xrayPreview)}
                      alt="Chest X-Ray Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-1.5 text-slate-500">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 stroke-[1.5]" />
                      <span className="text-[8px] uppercase tracking-wider font-semibold block text-slate-400">
                        X-RAY
                      </span>
                    </div>
                  )}

                  {uploadingXray && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      ref={xrayFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleXrayFileChange}
                      className="hidden"
                      id="report-xray-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingXray}
                      onClick={() => xrayFileInputRef.current?.click()}
                      className="gap-1.5 text-xs h-7"
                    >
                      <Upload className="h-3 w-3" />
                      <span>{xrayPreview ? 'Change X-Ray' : 'Upload Chest X-Ray'}</span>
                    </Button>

                    {xrayPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploadingXray}
                        onClick={handleRemoveXray}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-7 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Standard PA view chest radiograph. Embedded directly into verified PDF certificate.
                  </p>

                  {uploadXrayError && (
                    <p className="text-[10px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" />
                      {uploadXrayError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-600 block">Chest X-Ray Findings</span>
                  <select
                    value={xrayFinding}
                    onChange={(e) => setXrayFinding(e.target.value)}
                    className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="NAD">NAD (No Abnormality Detected)</option>
                    <option value="ABNORMAL">ABNORMAL</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-600 block">X-Ray Remarks</span>
                  <Input
                    value={xrayRemarks}
                    onChange={(e) => setXrayRemarks(e.target.value)}
                    className="h-8 text-xs font-semibold text-rose-700"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Laboratory Investigation */}
        <Card className="bg-white">
          <CardHeader className="py-2.5 bg-slate-900 text-white rounded-t">
            <CardTitle className="text-xs uppercase tracking-wider text-white font-semibold">
              Laboratory Investigation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {/* Urine Investigations */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Urine Sugar - Albumin</label>
              <Input
                value={reportData.urine_sugar_albumin}
                onChange={(e) => handleFieldChange('urine_sugar_albumin', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Urine Drugs (Opiates/Cannabis)</label>
                <Input
                  value={reportData.urine_opiates_cannabis}
                  onChange={(e) => handleFieldChange('urine_opiates_cannabis', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Urine Pregnancy Test</label>
                <Input
                  value={reportData.urine_pregnancy}
                  onChange={(e) => handleFieldChange('urine_pregnancy', e.target.value)}
                />
              </div>
            </div>

            {/* Blood Panel */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Blood Group</label>
                <select
                  value={reportData.blood_group}
                  onChange={(e) => handleFieldChange('blood_group', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="A (+VE)">A (+VE)</option>
                  <option value="A (-VE)">A (-VE)</option>
                  <option value="B (+VE)">B (+VE)</option>
                  <option value="B (-VE)">B (-VE)</option>
                  <option value="O (+VE)">O (+VE)</option>
                  <option value="O (-VE)">O (-VE)</option>
                  <option value="AB (+VE)">AB (+VE)</option>
                  <option value="AB (-VE)">AB (-VE)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Haemoglobin</label>
                <Input
                  value={reportData.haemoglobin}
                  onChange={(e) => handleFieldChange('haemoglobin', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">ESR</label>
                <Input
                  value={reportData.esr}
                  onChange={(e) => handleFieldChange('esr', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">R.B.S (mmol/L)</label>
                <Input
                  value={reportData.rbs}
                  onChange={(e) => handleFieldChange('rbs', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">S. Creatinine</label>
                <Input
                  value={reportData.s_creatinine}
                  onChange={(e) => handleFieldChange('s_creatinine', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">S. Bilirubin</label>
                <Input
                  value={reportData.s_bil}
                  onChange={(e) => handleFieldChange('s_bil', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">SGPT (ALT)</label>
                <Input
                  value={reportData.sgpt}
                  onChange={(e) => handleFieldChange('sgpt', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">SGOT (AST)</label>
                <Input
                  value={reportData.sgot}
                  onChange={(e) => handleFieldChange('sgot', e.target.value)}
                />
              </div>
            </div>

            {/* Infectious Serology */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">HIV I & HIV II *</label>
                <select
                  value={reportData.hiv}
                  onChange={(e) => handleFieldChange('hiv', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">HBsAg *</label>
                <select
                  value={reportData.hbsag}
                  onChange={(e) => handleFieldChange('hbsag', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Anti HCV *</label>
                <select
                  value={reportData.anti_hcv}
                  onChange={(e) => handleFieldChange('anti_hcv', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">VDRL *</label>
                <select
                  value={reportData.vdrl}
                  onChange={(e) => handleFieldChange('vdrl', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="NON REACTIVE">NON REACTIVE</option>
                  <option value="REACTIVE">REACTIVE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">TPHA</label>
                <select
                  value={reportData.tpha}
                  onChange={(e) => handleFieldChange('tpha', e.target.value)}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                >
                  <option value="NEGATIVE">NEGATIVE</option>
                  <option value="POSITIVE">POSITIVE</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Laboratory Remarks</label>
                <Input
                  value={reportData.lab_remarks}
                  onChange={(e) => handleFieldChange('lab_remarks', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer sticky bar */}
      <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
        <span className="text-xs text-slate-500">
          All values persist to PostgreSQL. Final medical status must be explicitly approved by an authorized medical professional.
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(false)}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={loading}
            onClick={() => handleSave(true)}
          >
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
}
