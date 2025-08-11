import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Save, AlertCircle, Compass } from "lucide-react";
import { Job, User } from "@shared/types";

interface DiscoveryFormData {
  id: string;
  jobId: string;
  date: string;
  insurance: string;
  claimNumber: string;
  client: string;
  plumber: string;
  address: string;
  
  // Discovery specific fields
  discoveryMemberNumber: string;
  membershipType: string;
  discoveryVitality: string;
  claimType: string;
  
  // Investigation details
  incidentDate: string;
  discoveryDate: string;
  investigationMethod: string;
  evidenceCollected: string;
  
  // Assessment findings
  rootCause: string;
  contributingFactors: string;
  preventabilityAssessment: string;
  riskRating: string;
  
  // Scope verification
  workScope: string;
  materialsRequired: string;
  timeEstimate: string;
  costBreakdown: string;
  
  // Quality metrics
  workmanshipStandard: boolean;
  materialQuality: boolean;
  complianceCheck: boolean;
  safetyProtocol: boolean;
  
  // Client interaction
  clientConsultation: string;
  expectationsManaged: boolean;
  communicationNotes: string;
  
  // Completion criteria
  deliverables: string;
  acceptanceCriteria: string;
  warrantyCoverage: string;
  maintenanceRecommendations: string;
  
  // Discovery insights
  lessonsLearned: string;
  improvementOpportunities: string;
  futurePreventionMeasures: string;
  
  additionalObservations: string;
}

interface DiscoveryFormProps {
  job: Job;
  assignedStaff: User | null;
  onSubmit: (formData: DiscoveryFormData) => void;
  existingData?: DiscoveryFormData;
}

export function DiscoveryForm({
  job,
  assignedStaff,
  onSubmit,
  existingData,
}: DiscoveryFormProps) {
  const [formData, setFormData] = useState<DiscoveryFormData>(() => ({
    id: existingData?.id || `discovery-form-${Date.now()}`,
    jobId: job.id,
    date: existingData?.date || new Date().toISOString().split("T")[0],
    insurance: existingData?.insurance || job.underwriter || job.Underwriter || "",
    claimNumber: existingData?.claimNumber || job.claimNo || job.ClaimNo || "",
    client: existingData?.client || job.insuredName || job.InsuredName || "",
    plumber: existingData?.plumber || assignedStaff?.name || "",
    address: existingData?.address || job.riskAddress || job.RiskAddress || "",
    
    discoveryMemberNumber: existingData?.discoveryMemberNumber || job.policyNo || job.PolicyNo || "",
    membershipType: existingData?.membershipType || "Core",
    discoveryVitality: existingData?.discoveryVitality || "Active",
    claimType: existingData?.claimType || "Property Damage",
    
    incidentDate: existingData?.incidentDate || job.incidentDate || "",
    discoveryDate: existingData?.discoveryDate || new Date().toISOString().split("T")[0],
    investigationMethod: existingData?.investigationMethod || "On-site Inspection",
    evidenceCollected: existingData?.evidenceCollected || "",
    
    rootCause: existingData?.rootCause || "",
    contributingFactors: existingData?.contributingFactors || "",
    preventabilityAssessment: existingData?.preventabilityAssessment || "Unpreventable",
    riskRating: existingData?.riskRating || "Medium",
    
    workScope: existingData?.workScope || job.description || "",
    materialsRequired: existingData?.materialsRequired || "",
    timeEstimate: existingData?.timeEstimate || "",
    costBreakdown: existingData?.costBreakdown || "",
    
    workmanshipStandard: existingData?.workmanshipStandard || true,
    materialQuality: existingData?.materialQuality || true,
    complianceCheck: existingData?.complianceCheck || true,
    safetyProtocol: existingData?.safetyProtocol || true,
    
    clientConsultation: existingData?.clientConsultation || "Conducted",
    expectationsManaged: existingData?.expectationsManaged || true,
    communicationNotes: existingData?.communicationNotes || "",
    
    deliverables: existingData?.deliverables || "",
    acceptanceCriteria: existingData?.acceptanceCriteria || "",
    warrantyCoverage: existingData?.warrantyCoverage || "Standard",
    maintenanceRecommendations: existingData?.maintenanceRecommendations || "",
    
    lessonsLearned: existingData?.lessonsLearned || "",
    improvementOpportunities: existingData?.improvementOpportunities || "",
    futurePreventionMeasures: existingData?.futurePreventionMeasures || "",
    
    additionalObservations: existingData?.additionalObservations || "",
  }));

  const [requiredFields, setRequiredFields] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const required = [];
    if (!formData.investigationMethod.trim()) required.push("investigationMethod");
    if (!formData.rootCause.trim()) required.push("rootCause");
    if (!formData.workScope.trim()) required.push("workScope");
    
    if (required.length > 0) {
      setRequiredFields(required);
      return;
    }
    
    setRequiredFields([]);
    onSubmit(formData);
  };

  const updateField = (field: keyof DiscoveryFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (requiredFields.includes(field as string)) {
      setRequiredFields(requiredFields.filter(f => f !== field));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center text-purple-800">
          <Search className="h-6 w-6 mr-3" />
          Discovery Form
          <Badge variant="outline" className="ml-3">
            {formData.claimType}
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
              <Label htmlFor="insurance">Insurance Company</Label>
              <Input
                id="insurance"
                value={formData.insurance}
                onChange={(e) => updateField("insurance", e.target.value)}
                className="bg-purple-50 font-medium"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="claimNumber">Claim Number</Label>
              <Input
                id="claimNumber"
                value={formData.claimNumber}
                onChange={(e) => updateField("claimNumber", e.target.value)}
                className="bg-purple-50 font-medium"
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
                className="bg-purple-50 font-medium"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="plumber">Investigator/Technician</Label>
              <Input
                id="plumber"
                value={formData.plumber}
                onChange={(e) => updateField("plumber", e.target.value)}
                className="bg-purple-50 font-medium"
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
              className="bg-purple-50"
              readOnly
            />
          </div>

          <Separator />

          {/* Discovery Specific Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Compass className="h-5 w-5 mr-2 text-purple-600" />
              Discovery Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discoveryMemberNumber">Discovery Member Number</Label>
                <Input
                  id="discoveryMemberNumber"
                  value={formData.discoveryMemberNumber}
                  onChange={(e) => updateField("discoveryMemberNumber", e.target.value)}
                  placeholder="Member account number"
                />
              </div>
              <div>
                <Label htmlFor="membershipType">Membership Type</Label>
                <Select value={formData.membershipType} onValueChange={(value) => updateField("membershipType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="Elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discoveryVitality">Discovery Vitality Status</Label>
                <Select value={formData.discoveryVitality} onValueChange={(value) => updateField("discoveryVitality", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="claimType">Claim Type</Label>
                <Select value={formData.claimType} onValueChange={(value) => updateField("claimType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Property Damage">Property Damage</SelectItem>
                    <SelectItem value="Water Damage">Water Damage</SelectItem>
                    <SelectItem value="Plumbing Issues">Plumbing Issues</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Investigation Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Investigation Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => updateField("incidentDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discoveryDate">Discovery Date</Label>
                <Input
                  id="discoveryDate"
                  type="date"
                  value={formData.discoveryDate}
                  onChange={(e) => updateField("discoveryDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="investigationMethod" className={requiredFields.includes("investigationMethod") ? "text-yellow-600" : ""}>
                Investigation Method *
              </Label>
              <Select value={formData.investigationMethod} onValueChange={(value) => updateField("investigationMethod", value)}>
                <SelectTrigger className={requiredFields.includes("investigationMethod") ? "border-yellow-500 bg-yellow-50" : ""}>
                  <SelectValue placeholder="Select investigation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On-site Inspection">On-site Inspection</SelectItem>
                  <SelectItem value="Remote Assessment">Remote Assessment</SelectItem>
                  <SelectItem value="Video Call">Video Call</SelectItem>
                  <SelectItem value="Document Review">Document Review</SelectItem>
                  <SelectItem value="Combined Approach">Combined Approach</SelectItem>
                </SelectContent>
              </Select>
              {requiredFields.includes("investigationMethod") && (
                <p className="text-yellow-600 text-sm mt-1">This field is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="evidenceCollected">Evidence Collected</Label>
              <Textarea
                id="evidenceCollected"
                value={formData.evidenceCollected}
                onChange={(e) => updateField("evidenceCollected", e.target.value)}
                placeholder="Photos, documents, witness statements, etc."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Assessment Findings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Assessment Findings</h3>

            <div>
              <Label htmlFor="rootCause" className={requiredFields.includes("rootCause") ? "text-yellow-600" : ""}>
                Root Cause Analysis *
              </Label>
              <Textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => updateField("rootCause", e.target.value)}
                placeholder="Primary cause of the issue..."
                className={requiredFields.includes("rootCause") ? "border-yellow-500 bg-yellow-50" : ""}
                rows={3}
              />
              {requiredFields.includes("rootCause") && (
                <p className="text-yellow-600 text-sm mt-1">This field is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="contributingFactors">Contributing Factors</Label>
              <Textarea
                id="contributingFactors"
                value={formData.contributingFactors}
                onChange={(e) => updateField("contributingFactors", e.target.value)}
                placeholder="Secondary factors that contributed..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preventabilityAssessment">Preventability Assessment</Label>
                <Select value={formData.preventabilityAssessment} onValueChange={(value) => updateField("preventabilityAssessment", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventable">Preventable</SelectItem>
                    <SelectItem value="Partially Preventable">Partially Preventable</SelectItem>
                    <SelectItem value="Unpreventable">Unpreventable</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="riskRating">Risk Rating</Label>
                <Select value={formData.riskRating} onValueChange={(value) => updateField("riskRating", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Scope Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Scope Verification</h3>

            <div>
              <Label htmlFor="workScope" className={requiredFields.includes("workScope") ? "text-yellow-600" : ""}>
                Work Scope *
              </Label>
              <Textarea
                id="workScope"
                value={formData.workScope}
                onChange={(e) => updateField("workScope", e.target.value)}
                placeholder="Detailed scope of work required..."
                className={requiredFields.includes("workScope") ? "border-yellow-500 bg-yellow-50" : ""}
                rows={3}
              />
              {requiredFields.includes("workScope") && (
                <p className="text-yellow-600 text-sm mt-1">This field is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="materialsRequired">Materials Required</Label>
              <Textarea
                id="materialsRequired"
                value={formData.materialsRequired}
                onChange={(e) => updateField("materialsRequired", e.target.value)}
                placeholder="List of materials and components needed..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeEstimate">Time Estimate</Label>
                <Input
                  id="timeEstimate"
                  value={formData.timeEstimate}
                  onChange={(e) => updateField("timeEstimate", e.target.value)}
                  placeholder="e.g. 2-3 hours, 1 day"
                />
              </div>
              <div>
                <Label htmlFor="costBreakdown">Cost Breakdown</Label>
                <Input
                  id="costBreakdown"
                  value={formData.costBreakdown}
                  onChange={(e) => updateField("costBreakdown", e.target.value)}
                  placeholder="R 0.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Quality Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Quality Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workmanshipStandard"
                  checked={formData.workmanshipStandard}
                  onCheckedChange={(checked) => updateField("workmanshipStandard", checked as boolean)}
                />
                <Label htmlFor="workmanshipStandard">Workmanship meets standards</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="materialQuality"
                  checked={formData.materialQuality}
                  onCheckedChange={(checked) => updateField("materialQuality", checked as boolean)}
                />
                <Label htmlFor="materialQuality">Material quality verified</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="complianceCheck"
                  checked={formData.complianceCheck}
                  onCheckedChange={(checked) => updateField("complianceCheck", checked as boolean)}
                />
                <Label htmlFor="complianceCheck">Compliance requirements met</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safetyProtocol"
                  checked={formData.safetyProtocol}
                  onCheckedChange={(checked) => updateField("safetyProtocol", checked as boolean)}
                />
                <Label htmlFor="safetyProtocol">Safety protocols followed</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Interaction */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Client Interaction</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientConsultation">Client Consultation</Label>
                <Select value={formData.clientConsultation} onValueChange={(value) => updateField("clientConsultation", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conducted">Conducted</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Not Required">Not Required</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="expectationsManaged"
                  checked={formData.expectationsManaged}
                  onCheckedChange={(checked) => updateField("expectationsManaged", checked as boolean)}
                />
                <Label htmlFor="expectationsManaged">Client expectations managed</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="communicationNotes">Communication Notes</Label>
              <Textarea
                id="communicationNotes"
                value={formData.communicationNotes}
                onChange={(e) => updateField("communicationNotes", e.target.value)}
                placeholder="Notes from client interactions..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Completion Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Completion Criteria</h3>

            <div>
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                value={formData.deliverables}
                onChange={(e) => updateField("deliverables", e.target.value)}
                placeholder="What will be delivered to the client..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
              <Textarea
                id="acceptanceCriteria"
                value={formData.acceptanceCriteria}
                onChange={(e) => updateField("acceptanceCriteria", e.target.value)}
                placeholder="Criteria for client acceptance..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyCoverage">Warranty Coverage</Label>
                <Select value={formData.warrantyCoverage} onValueChange={(value) => updateField("warrantyCoverage", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Extended">Extended</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenanceRecommendations">Maintenance Recommendations</Label>
                <Input
                  id="maintenanceRecommendations"
                  value={formData.maintenanceRecommendations}
                  onChange={(e) => updateField("maintenanceRecommendations", e.target.value)}
                  placeholder="Ongoing maintenance advice"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Discovery Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Discovery Insights</h3>

            <div>
              <Label htmlFor="lessonsLearned">Lessons Learned</Label>
              <Textarea
                id="lessonsLearned"
                value={formData.lessonsLearned}
                onChange={(e) => updateField("lessonsLearned", e.target.value)}
                placeholder="Key insights from this investigation..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="improvementOpportunities">Improvement Opportunities</Label>
              <Textarea
                id="improvementOpportunities"
                value={formData.improvementOpportunities}
                onChange={(e) => updateField("improvementOpportunities", e.target.value)}
                placeholder="Areas for process improvement..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="futurePreventionMeasures">Future Prevention Measures</Label>
              <Textarea
                id="futurePreventionMeasures"
                value={formData.futurePreventionMeasures}
                onChange={(e) => updateField("futurePreventionMeasures", e.target.value)}
                placeholder="Recommendations to prevent similar issues..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Additional Observations */}
          <div>
            <Label htmlFor="additionalObservations">Additional Observations</Label>
            <Textarea
              id="additionalObservations"
              value={formData.additionalObservations}
              onChange={(e) => updateField("additionalObservations", e.target.value)}
              placeholder="Any other relevant observations or comments..."
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
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Submit Discovery Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
