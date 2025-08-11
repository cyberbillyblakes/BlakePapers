import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Job, User } from "@shared/types";

interface ClearanceCertificateFormData {
  id: string;
  jobId: string;
  date: string;
  insurance: string;
  claimNumber: string;
  client: string;
  plumber: string;
  address: string;
  
  // Certificate details
  workDescription: string;
  certificateType: string;
  complianceStandard: string;
  workStartDate: string;
  workCompletionDate: string;
  
  // Inspection details
  materialUsed: string;
  workmanshipStandard: string;
  safetyCompliance: string;
  regulatoryCompliance: string;
  
  // Verification
  finalInspection: string;
  pressureTesting: string;
  functioningTest: string;
  
  // Declaration
  declarationStatement: string;
  issuerName: string;
  issuerQualification: string;
  issueDate: string;
  
  additionalComments: string;
}

interface ClearanceCertificateFormProps {
  job: Job;
  assignedStaff: User | null;
  onSubmit: (formData: ClearanceCertificateFormData) => void;
  existingData?: ClearanceCertificateFormData;
}

export function ClearanceCertificateForm({
  job,
  assignedStaff,
  onSubmit,
  existingData,
}: ClearanceCertificateFormProps) {
  const [formData, setFormData] = useState<ClearanceCertificateFormData>(() => ({
    id: existingData?.id || `clearance-cert-${Date.now()}`,
    jobId: job.id,
    date: existingData?.date || new Date().toISOString().split("T")[0],
    insurance: existingData?.insurance || job.underwriter || job.Underwriter || "",
    claimNumber: existingData?.claimNumber || job.claimNo || job.ClaimNo || "",
    client: existingData?.client || job.insuredName || job.InsuredName || "",
    plumber: existingData?.plumber || assignedStaff?.name || "",
    address: existingData?.address || job.riskAddress || job.RiskAddress || "",
    
    workDescription: existingData?.workDescription || "",
    certificateType: existingData?.certificateType || "Plumbing Work",
    complianceStandard: existingData?.complianceStandard || "SANS 10252",
    workStartDate: existingData?.workStartDate || new Date().toISOString().split("T")[0],
    workCompletionDate: existingData?.workCompletionDate || new Date().toISOString().split("T")[0],
    
    materialUsed: existingData?.materialUsed || "",
    workmanshipStandard: existingData?.workmanshipStandard || "Compliant",
    safetyCompliance: existingData?.safetyCompliance || "Yes",
    regulatoryCompliance: existingData?.regulatoryCompliance || "Yes",
    
    finalInspection: existingData?.finalInspection || "Passed",
    pressureTesting: existingData?.pressureTesting || "Passed",
    functioningTest: existingData?.functioningTest || "Passed",
    
    declarationStatement: existingData?.declarationStatement || "I hereby certify that the plumbing work described has been completed in accordance with applicable standards and regulations.",
    issuerName: existingData?.issuerName || assignedStaff?.name || "",
    issuerQualification: existingData?.issuerQualification || "Qualified Plumber",
    issueDate: existingData?.issueDate || new Date().toISOString().split("T")[0],
    
    additionalComments: existingData?.additionalComments || "",
  }));

  const [requiredFields, setRequiredFields] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const required = [];
    if (!formData.workDescription.trim()) required.push("workDescription");
    if (!formData.materialUsed.trim()) required.push("materialUsed");
    if (!formData.issuerName.trim()) required.push("issuerName");
    
    if (required.length > 0) {
      setRequiredFields(required);
      return;
    }
    
    setRequiredFields([]);
    onSubmit(formData);
  };

  const updateField = (field: keyof ClearanceCertificateFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (requiredFields.includes(field)) {
      setRequiredFields(requiredFields.filter(f => f !== field));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="flex items-center text-green-800">
          <Shield className="h-6 w-6 mr-3" />
          Clearance Certificate
          <Badge variant="outline" className="ml-3">
            {formData.certificateType}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance</Label>
              <Input
                id="insurance"
                value={formData.insurance}
                onChange={(e) => updateField("insurance", e.target.value)}
                className="bg-green-50 font-medium"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="claimNumber">Claim Number</Label>
              <Input
                id="claimNumber"
                value={formData.claimNumber}
                onChange={(e) => updateField("claimNumber", e.target.value)}
                className="bg-green-50 font-medium"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => updateField("client", e.target.value)}
                className="bg-green-50 font-medium"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="plumber">Plumber</Label>
              <Input
                id="plumber"
                value={formData.plumber}
                onChange={(e) => updateField("plumber", e.target.value)}
                className="bg-green-50 font-medium"
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Property Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="bg-green-50"
              readOnly
            />
          </div>

          <Separator />

          {/* Certificate Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Certificate Details
            </h3>

            <div>
              <Label htmlFor="workDescription" className={requiredFields.includes("workDescription") ? "text-yellow-600" : ""}>
                Work Description *
              </Label>
              <Textarea
                id="workDescription"
                value={formData.workDescription}
                onChange={(e) => updateField("workDescription", e.target.value)}
                placeholder="Describe the plumbing work completed..."
                className={requiredFields.includes("workDescription") ? "border-yellow-500 bg-yellow-50" : ""}
                rows={3}
              />
              {requiredFields.includes("workDescription") && (
                <p className="text-yellow-600 text-sm mt-1">This field is required</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateType">Certificate Type</Label>
                <Select value={formData.certificateType} onValueChange={(value) => updateField("certificateType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing Work">Plumbing Work</SelectItem>
                    <SelectItem value="Geyser Installation">Geyser Installation</SelectItem>
                    <SelectItem value="Pipe Repair">Pipe Repair</SelectItem>
                    <SelectItem value="System Installation">System Installation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="complianceStandard">Compliance Standard</Label>
                <Select value={formData.complianceStandard} onValueChange={(value) => updateField("complianceStandard", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SANS 10252">SANS 10252</SelectItem>
                    <SelectItem value="SANS 10254">SANS 10254</SelectItem>
                    <SelectItem value="Municipal Bylaws">Municipal Bylaws</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workStartDate">Work Start Date</Label>
                <Input
                  id="workStartDate"
                  type="date"
                  value={formData.workStartDate}
                  onChange={(e) => updateField("workStartDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workCompletionDate">Work Completion Date</Label>
                <Input
                  id="workCompletionDate"
                  type="date"
                  value={formData.workCompletionDate}
                  onChange={(e) => updateField("workCompletionDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Inspection Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Inspection & Compliance</h3>

            <div>
              <Label htmlFor="materialUsed" className={requiredFields.includes("materialUsed") ? "text-yellow-600" : ""}>
                Materials Used *
              </Label>
              <Textarea
                id="materialUsed"
                value={formData.materialUsed}
                onChange={(e) => updateField("materialUsed", e.target.value)}
                placeholder="List materials and components used..."
                className={requiredFields.includes("materialUsed") ? "border-yellow-500 bg-yellow-50" : ""}
                rows={2}
              />
              {requiredFields.includes("materialUsed") && (
                <p className="text-yellow-600 text-sm mt-1">This field is required</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workmanshipStandard">Workmanship Standard</Label>
                <Select value={formData.workmanshipStandard} onValueChange={(value) => updateField("workmanshipStandard", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="safetyCompliance">Safety Compliance</Label>
                <Select value={formData.safetyCompliance} onValueChange={(value) => updateField("safetyCompliance", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="regulatoryCompliance">Regulatory Compliance</Label>
              <Select value={formData.regulatoryCompliance} onValueChange={(value) => updateField("regulatoryCompliance", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Verification Tests</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="finalInspection">Final Inspection</Label>
                <Select value={formData.finalInspection} onValueChange={(value) => updateField("finalInspection", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pressureTesting">Pressure Testing</Label>
                <Select value={formData.pressureTesting} onValueChange={(value) => updateField("pressureTesting", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="functioningTest">Functioning Test</Label>
                <Select value={formData.functioningTest} onValueChange={(value) => updateField("functioningTest", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Declaration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Declaration</h3>

            <div>
              <Label htmlFor="declarationStatement">Declaration Statement</Label>
              <Textarea
                id="declarationStatement"
                value={formData.declarationStatement}
                onChange={(e) => updateField("declarationStatement", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issuerName" className={requiredFields.includes("issuerName") ? "text-yellow-600" : ""}>
                  Issuer Name *
                </Label>
                <Input
                  id="issuerName"
                  value={formData.issuerName}
                  onChange={(e) => updateField("issuerName", e.target.value)}
                  placeholder="Name of person issuing certificate"
                  className={requiredFields.includes("issuerName") ? "border-yellow-500 bg-yellow-50" : ""}
                />
                {requiredFields.includes("issuerName") && (
                  <p className="text-yellow-600 text-sm mt-1">This field is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="issuerQualification">Issuer Qualification</Label>
                <Input
                  id="issuerQualification"
                  value={formData.issuerQualification}
                  onChange={(e) => updateField("issuerQualification", e.target.value)}
                  placeholder="Professional qualification"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => updateField("issueDate", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Additional Comments */}
          <div>
            <Label htmlFor="additionalComments">Additional Comments</Label>
            <Textarea
              id="additionalComments"
              value={formData.additionalComments}
              onChange={(e) => updateField("additionalComments", e.target.value)}
              placeholder="Any additional notes or observations..."
              rows={3}
            />
          </div>

          {/* Required fields notice */}
          {requiredFields.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  Please fill in all required fields to submit the form
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Submit Certificate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
