import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Save, AlertCircle, ArrowRight, Settings } from "lucide-react";
import { Job, User } from "@shared/types";

interface LiabilityFormData {
  id: string;
  jobId: string;
  date: string;
  insurance: string;
  claimNumber: string;
  client: string;
  plumber: string;
  wasExcessPaid: string;

  // Assessment items - now as checkboxes that place X in PDF
  selectedAssessmentItems: string[];

  // Before/After sections
  waterHammerBefore: string;
  waterHammerAfter: string;
  pressureTestBefore: string;
  pressureTestAfter: string;
  thermostatSettingBefore: string;
  thermostatSettingAfter: string;
  externalIsolatorBefore: string;
  externalIsolatorAfter: string;
  numberOfGeysersBefore: string;
  numberOfGeysersAfter: string;
  balancedSystemBefore: string;
  balancedSystemAfter: string;
  nonReturnValveBefore: string;
  nonReturnValveAfter: string;

  // Additional core form questions after water hammer
  pipeInstallation: string;
  pipeInsulation: string;
  pressureRegulation: string;
  temperatureControl: string;
  safetyCompliance: string;
  workmanshipQuality: string;
  materialStandards: string;
  installationCertificate: string;

  additionalComments: string;
}

interface EnhancedLiabilityFormProps {
  job: Job;
  assignedStaff: User | null;
  onSubmit: (formData: LiabilityFormData) => void;
  existingData?: LiabilityFormData;
}

export function EnhancedLiabilityForm({
  job,
  assignedStaff,
  onSubmit,
  existingData,
}: EnhancedLiabilityFormProps) {
  // Assessment items that can be selected
  const assessmentItems = [
    "Existing Pipes/Fittings",
    "Roof Entry",
    "Geyser Enclosure",
    "Wiring (Electrical/Alarm)",
    "Waterproofing",
    "Pipes Not Secured",
    "Increase/Decrease in Pressure",
    "Drip Tray Installation",
    "Vacuum Breaker Positioning",
    "Pressure Control Valve",
    "Non-Return Valve",
    "Safety Valve Operation",
    "Thermostat Calibration",
    "Element Condition",
    "Electrical Connections",
  ];

  const [formData, setFormData] = useState<LiabilityFormData>(() => ({
    id: existingData?.id || `liability-${Date.now()}`,
    jobId: job.id,
    date: existingData?.date || new Date().toISOString().split("T")[0],
    insurance:
      existingData?.insurance || job.underwriter || job.Underwriter || "",
    claimNumber: existingData?.claimNumber || job.claimNo || job.ClaimNo || "",
    client: existingData?.client || job.insuredName || job.InsuredName || "",
    plumber: existingData?.plumber || assignedStaff?.name || "",
    wasExcessPaid: existingData?.wasExcessPaid || "",

    selectedAssessmentItems: existingData?.selectedAssessmentItems || [],

    waterHammerBefore: existingData?.waterHammerBefore || "",
    waterHammerAfter: existingData?.waterHammerAfter || "",
    pressureTestBefore: existingData?.pressureTestBefore || "",
    pressureTestAfter: existingData?.pressureTestAfter || "",
    thermostatSettingBefore: existingData?.thermostatSettingBefore || "",
    thermostatSettingAfter: existingData?.thermostatSettingAfter || "",
    externalIsolatorBefore: existingData?.externalIsolatorBefore || "",
    externalIsolatorAfter: existingData?.externalIsolatorAfter || "",
    numberOfGeysersBefore: existingData?.numberOfGeysersBefore || "",
    numberOfGeysersAfter: existingData?.numberOfGeysersAfter || "",
    balancedSystemBefore: existingData?.balancedSystemBefore || "",
    balancedSystemAfter: existingData?.balancedSystemAfter || "",
    nonReturnValveBefore: existingData?.nonReturnValveBefore || "",
    nonReturnValveAfter: existingData?.nonReturnValveAfter || "",

    // Additional core form questions
    pipeInstallation: existingData?.pipeInstallation || "",
    pipeInsulation: existingData?.pipeInsulation || "",
    pressureRegulation: existingData?.pressureRegulation || "",
    temperatureControl: existingData?.temperatureControl || "",
    safetyCompliance: existingData?.safetyCompliance || "",
    workmanshipQuality: existingData?.workmanshipQuality || "",
    materialStandards: existingData?.materialStandards || "",
    installationCertificate: existingData?.installationCertificate || "",

    additionalComments: existingData?.additionalComments || "",
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof LiabilityFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssessmentItem = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAssessmentItems: prev.selectedAssessmentItems.includes(item)
        ? prev.selectedAssessmentItems.filter(i => i !== item)
        : [...prev.selectedAssessmentItems, item]
    }));
  };

  const BeforeAfterField = ({
    label,
    beforeField,
    afterField,
  }: {
    label: string;
    beforeField: keyof LiabilityFormData;
    afterField: keyof LiabilityFormData;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div className="font-medium text-sm">{label}</div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">Before</Label>
        <Input
          value={formData[beforeField] as string}
          onChange={(e) => updateField(beforeField, e.target.value)}
          placeholder="Before value"
          className="text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-600">After</Label>
        <Input
          value={formData[afterField] as string}
          onChange={(e) => updateField(afterField, e.target.value)}
          placeholder="After value"
          className="text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Enhanced Liability Waiver Form
            <Badge variant="outline" className="ml-2">
              {job.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="text-sm bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Insurance</Label>
                <Input
                  value={formData.insurance}
                  onChange={(e) => updateField("insurance", e.target.value)}
                  className="text-sm bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Claim Number
                </Label>
                <Input
                  value={formData.claimNumber}
                  onChange={(e) => updateField("claimNumber", e.target.value)}
                  className="text-sm bg-white"
                  placeholder="Auto-filled from job"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Client</Label>
                <Input
                  value={formData.client}
                  onChange={(e) => updateField("client", e.target.value)}
                  className="text-sm bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Plumber</Label>
                <Input
                  value={formData.plumber}
                  onChange={(e) => updateField("plumber", e.target.value)}
                  className="text-sm bg-white"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Was Excess Paid?</Label>
                <Select
                  value={formData.wasExcessPaid}
                  onValueChange={(value) => updateField("wasExcessPaid", value)}
                >
                  <SelectTrigger className="text-sm bg-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Assessment Items - Checkboxes */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                Assessment Items
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select all applicable items. These will be marked with 'X' on the PDF form.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {assessmentItems.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={item}
                      checked={formData.selectedAssessmentItems.includes(item)}
                      onCheckedChange={() => toggleAssessmentItem(item)}
                    />
                    <Label htmlFor={item} className="text-sm cursor-pointer">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Before/After Sections */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-green-600" />
                Before/After Comparisons
              </h3>
              <div className="space-y-4">
                <BeforeAfterField
                  label="Water Hammer"
                  beforeField="waterHammerBefore"
                  afterField="waterHammerAfter"
                />
                <BeforeAfterField
                  label="Pressure Test (Rating)"
                  beforeField="pressureTestBefore"
                  afterField="pressureTestAfter"
                />
                <BeforeAfterField
                  label="Thermostat Setting"
                  beforeField="thermostatSettingBefore"
                  afterField="thermostatSettingAfter"
                />
                <BeforeAfterField
                  label="External Isolator"
                  beforeField="externalIsolatorBefore"
                  afterField="externalIsolatorAfter"
                />
                <BeforeAfterField
                  label="Number of Geysers on Property"
                  beforeField="numberOfGeysersBefore"
                  afterField="numberOfGeysersAfter"
                />
                <BeforeAfterField
                  label="Balanced System"
                  beforeField="balancedSystemBefore"
                  afterField="balancedSystemAfter"
                />
                <BeforeAfterField
                  label="Non Return Valve"
                  beforeField="nonReturnValveBefore"
                  afterField="nonReturnValveAfter"
                />
              </div>
            </div>

            <Separator />

            {/* Additional Core Form Questions */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Additional Assessment Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pipe Installation Quality</Label>
                  <Select
                    value={formData.pipeInstallation}
                    onValueChange={(value) => updateField("pipeInstallation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="acceptable">Acceptable</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="not-applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pipe Insulation</Label>
                  <Select
                    value={formData.pipeInsulation}
                    onValueChange={(value) => updateField("pipeInsulation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adequate">Adequate</SelectItem>
                      <SelectItem value="inadequate">Inadequate</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                      <SelectItem value="not-required">Not Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pressure Regulation</Label>
                  <Select
                    value={formData.pressureRegulation}
                    onValueChange={(value) => updateField("pressureRegulation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="within-limits">Within Limits</SelectItem>
                      <SelectItem value="too-high">Too High</SelectItem>
                      <SelectItem value="too-low">Too Low</SelectItem>
                      <SelectItem value="not-tested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperature Control</Label>
                  <Select
                    value={formData.temperatureControl}
                    onValueChange={(value) => updateField("temperatureControl", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="functioning">Functioning Correctly</SelectItem>
                      <SelectItem value="erratic">Erratic</SelectItem>
                      <SelectItem value="not-functioning">Not Functioning</SelectItem>
                      <SelectItem value="needs-adjustment">Needs Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Safety Compliance</Label>
                  <Select
                    value={formData.safetyCompliance}
                    onValueChange={(value) => updateField("safetyCompliance", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliant">Fully Compliant</SelectItem>
                      <SelectItem value="minor-issues">Minor Issues</SelectItem>
                      <SelectItem value="major-issues">Major Issues</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Workmanship Quality</Label>
                  <Select
                    value={formData.workmanshipQuality}
                    onValueChange={(value) => updateField("workmanshipQuality", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 - Excellent</SelectItem>
                      <SelectItem value="9">9 - Very Good</SelectItem>
                      <SelectItem value="8">8 - Good</SelectItem>
                      <SelectItem value="7">7 - Above Average</SelectItem>
                      <SelectItem value="6">6 - Average</SelectItem>
                      <SelectItem value="5">5 - Below Average</SelectItem>
                      <SelectItem value="4">4 - Poor</SelectItem>
                      <SelectItem value="3">3 - Very Poor</SelectItem>
                      <SelectItem value="2">2 - Unacceptable</SelectItem>
                      <SelectItem value="1">1 - Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material Standards</Label>
                  <Select
                    value={formData.materialStandards}
                    onValueChange={(value) => updateField("materialStandards", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sabs-approved">SABS Approved</SelectItem>
                      <SelectItem value="iso-certified">ISO Certified</SelectItem>
                      <SelectItem value="non-standard">Non-Standard</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Installation Certificate</Label>
                  <Select
                    value={formData.installationCertificate}
                    onValueChange={(value) => updateField("installationCertificate", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="issued">Certificate Issued</SelectItem>
                      <SelectItem value="pending">Pending Issue</SelectItem>
                      <SelectItem value="not-required">Not Required</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Comments */}
            <div>
              <Label>Additional Comments</Label>
              <Textarea
                value={formData.additionalComments}
                onChange={(e) =>
                  updateField("additionalComments", e.target.value)
                }
                placeholder="Enter any additional comments from staff assessment..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Liability Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Before/After Fields:</strong> Enter numbers, words, or
              simply "X" as needed for each assessment item.
            </p>
            <p>
              <strong>Primary Items:</strong> Assess each item and mark with
              appropriate values or "X" if not applicable.
            </p>
            <p>
              <strong>Additional Comments:</strong> Use this section to provide
              detailed notes on any specific findings or recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
