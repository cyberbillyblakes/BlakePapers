import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  User,
  Building,
  Smartphone,
  Check,
  AlertCircle,
} from "lucide-react";
import { Job, Form, User as UserType, FormField } from "@shared/types";
import { FullScreenSignaturePad } from "@/components/FullScreenSignaturePad";
import { useAuth } from "@/contexts/AuthContext";
import { NoncomplianceForm } from "@/components/NoncomplianceForm";
import { MaterialListForm } from "@/components/MaterialListForm";
import { EnhancedLiabilityForm } from "@/components/EnhancedLiabilityForm";
import { ClearanceCertificateForm } from "@/components/ClearanceCertificateForm";
import { SAHLCertificateForm } from "@/components/SAHLCertificateForm";
import { ABSAForm } from "@/components/ABSAForm";
import { DiscoveryForm } from "@/components/DiscoveryForm";

export default function EnhancedFormFillPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get jobId and formId from either state or URL params
  const urlParams = new URLSearchParams(location.search);
  const stateParams = (location.state as any) || {};

  const jobId = stateParams.jobId || urlParams.get("jobId");
  const formId = stateParams.formId || urlParams.get("formId");

  const [job, setJob] = useState<Job | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [staff, setStaff] = useState<UserType[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "staff" | "client" | "signature"
  >("staff");
  const [autoSaveKey, setAutoSaveKey] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const handleSuccessfulSubmission = () => {
    setSuccess(true);
    setHasBeenSubmitted(true);
    setTimeout(() => {
      setSuccess(false);
      // Navigate to home page
      navigate('/');
    }, 2000);
  };

  // Auto-save functionality
  const saveFormData = useCallback(
    (data: Record<string, any>) => {
      if (autoSaveKey) {
        localStorage.setItem(autoSaveKey, JSON.stringify(data));
      }
    },
    [autoSaveKey],
  );

  const loadSavedData = useCallback(() => {
    if (autoSaveKey) {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved form data:", e);
        }
      }
    }
    return {};
  }, [autoSaveKey]);

  useEffect(() => {
    if (jobId && formId) {
      setAutoSaveKey(`form_${jobId}_${formId}`);
      fetchData();
    } else {
      setError("Missing job or form information");
      setLoading(false);
    }
  }, [jobId, formId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Custom forms that don't exist in database
      const customFormIds = [
        "noncompliance-form",
        "material-list-form",
        "liability-form",
        "clearance-certificate-form",
        "sahl-certificate-form",
        "absa-form",
        "discovery-form"
      ];
      const isCustomForm = customFormIds.includes(formId || "");

      let fetchPromises;
      if (isCustomForm) {
        // For custom forms, only fetch job and staff data
        fetchPromises = [
          fetch(`/api/jobs?id=${jobId}`, { headers }),
          fetch("/api/auth/users", { headers }),
        ];
      } else {
        // For database forms, fetch all three
        fetchPromises = [
          fetch(`/api/jobs?id=${jobId}`, { headers }),
          fetch(`/api/forms/${formId}`, { headers }),
          fetch("/api/auth/users", { headers }),
        ];
      }

      const responses = await Promise.all(fetchPromises);

      // Check response status before calling .json()
      if (!responses[0].ok) {
        throw new Error(`Failed to fetch job: ${responses[0].status}`);
      }

      if (isCustomForm) {
        // For custom forms: [job, staff]
        if (!responses[1].ok) {
          throw new Error(`Failed to fetch staff: ${responses[1].status}`);
        }
      } else {
        // For database forms: [job, form, staff]
        if (!responses[1].ok) {
          throw new Error(`Failed to fetch form: ${responses[1].status}`);
        }
        if (!responses[2].ok) {
          throw new Error(`Failed to fetch staff: ${responses[2].status}`);
        }
      }

      let jobsData, formData, staffData;
      if (isCustomForm) {
        [jobsData, staffData] = await Promise.all([
          responses[0].json(),
          responses[1].json(),
        ]);
        // Create a mock form object for custom forms
        formData = {
          id: formId,
          name: formId?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Custom Form",
          fields: [], // Custom forms handle their own fields
        };
      } else {
        [jobsData, formData, staffData] = await Promise.all([
          responses[0].json(),
          responses[1].json(),
          responses[2].json(),
        ]);
      }

      const jobDetails = Array.isArray(jobsData)
        ? jobsData.find((j) => j.id === jobId)
        : jobsData;

      if (!jobDetails) {
        throw new Error("Job not found");
      }

      setJob(jobDetails);
      setForm(formData);
      setStaff(staffData.filter((u: UserType) => u.role === "staff"));

      // Load saved data first
      const savedData = loadSavedData();

      // Auto-fill form data with job and staff information
      const autoFilledData: Record<string, any> = { ...savedData };

      // Pre-fill known data from job
      formData.fields.forEach((field: FormField) => {
        if (autoFilledData[field.id]) return; // Don't override saved data

        const fieldLabel = field.label.toLowerCase();
        const fieldId = field.id;

        // Auto-fill based on autoFillFrom property
        if (field.autoFillFrom) {
          switch (field.autoFillFrom) {
            case "title":
              autoFilledData[fieldId] = jobDetails.title || "";
              break;
            case "assignedStaffName":
              const assignedStaff = staffData.find(
                (s: UserType) => s.id === jobDetails.assignedTo,
              );
              autoFilledData[fieldId] = assignedStaff?.name || "";
              break;
            case "clientName":
              autoFilledData[fieldId] =
                jobDetails.insuredName || jobDetails.InsuredName || "";
              break;
            case "claimNo":
              autoFilledData[fieldId] =
                jobDetails.claimNo || jobDetails.ClaimNo || "";
              break;
            default:
              // Try to match from job data
              const value = jobDetails[field.autoFillFrom];
              if (value) autoFilledData[fieldId] = value;
          }
        }

        // Legacy auto-fill logic for backward compatibility
        const assignedStaff = staffData.find(
          (s: UserType) => s.id === jobDetails.assignedTo,
        );

        if (assignedStaff) {
          if (
            fieldLabel.includes("staff") ||
            fieldLabel.includes("technician") ||
            fieldLabel.includes("inspector")
          ) {
            autoFilledData[fieldId] = assignedStaff.name;
          }
        }

        // Client information auto-fill
        if (fieldLabel.includes("client") || fieldLabel.includes("insured")) {
          if (fieldLabel.includes("name")) {
            autoFilledData[fieldId] =
              jobDetails.insuredName || jobDetails.InsuredName || "";
          }
          if (fieldLabel.includes("email")) {
            autoFilledData[fieldId] =
              jobDetails.insEmail || jobDetails.Email || "";
          }
        }

        // Address auto-fill
        if (fieldLabel.includes("address") || fieldLabel.includes("location")) {
          autoFilledData[fieldId] =
            jobDetails.riskAddress || jobDetails.RiskAddress || "";
        }

        // Auto-calculate excess amount
        if (field.autoCalculate && fieldLabel.includes("amount")) {
          const excessPaidField = formData.fields.find((f: FormField) =>
            f.label.toLowerCase().includes("excess paid"),
          );
          if (excessPaidField) {
            const excessPaid = autoFilledData[excessPaidField.id];
            if (excessPaid === "Yes") {
              autoFilledData[fieldId] =
                jobDetails.excess || jobDetails.Excess || "0";
            } else {
              autoFilledData[fieldId] = "0";
            }
          }
        }
      });

      setFormData(autoFilledData);
      saveFormData(autoFilledData);
    } catch (error) {
      setError("Failed to load form data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    const updatedData = {
      ...formData,
      [fieldId]: value,
    };

    // Handle auto-calculation for excess amount
    if (form) {
      const changedField = form.fields.find((f) => f.id === fieldId);
      if (changedField?.label.toLowerCase().includes("excess paid")) {
        const amountField = form.fields.find(
          (f) => f.autoCalculate && f.label.toLowerCase().includes("amount"),
        );
        if (amountField && job) {
          if (value === "Yes") {
            updatedData[amountField.id] = job.excess || job.Excess || "0";
          } else {
            updatedData[amountField.id] = "0";
          }
        }
      }
    }

    setFormData(updatedData);
    saveFormData(updatedData);
  };

  const handleNextSection = () => {
    if (currentSection === "staff") {
      // Check if form requires signature
      const requiresSignature = form && ["Clearance Certificate", "SAHL Certificate Form", "ABSA Form", "Discovery Form"].includes(form.name);

      if (requiresSignature) {
        setCurrentSection("client");
      } else {
        // For forms without signature requirement, this shouldn't be called
        // as the staff section shows a Submit button instead
        console.warn("handleNextSection called for non-signature form");
      }
    } else if (currentSection === "client") {
      setCurrentSection("signature");
      setShowSignaturePad(true);
    }
  };

  const handleBackSection = () => {
    if (currentSection === "signature") {
      setCurrentSection("client");
    } else if (currentSection === "client") {
      setCurrentSection("staff");
    }
  };

  const handleSignatureComplete = (signatureData: string) => {
    setSignature(signatureData);
    setShowSignaturePad(false);

    // Save signature to form data
    const updatedData = {
      ...formData,
      signature: signatureData,
    };
    setFormData(updatedData);
    saveFormData(updatedData);
  };

  const validateForm = () => {
    if (!form) return [];

    // Skip validation for core forms (make all fields optional)
    const coreFormIds = ["noncompliance-form", "material-list-form", "liability-form"];
    if (coreFormIds.includes(formId || "")) {
      return []; // No validation for core forms
    }

    const errors: string[] = [];
    const currentFields = getFieldsBySection(currentSection);

    currentFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.id];

        // Check if field is empty
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors.push(field.id);
          return;
        }

        // Type validation based on field type
        if (field.type === 'number' && value) {
          const numValue = parseFloat(value.toString());
          if (isNaN(numValue)) {
            errors.push(field.id);
            return;
          }
        }

        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.toString())) {
            errors.push(field.id);
            return;
          }
        }

        if (field.type === 'tel' && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value.toString())) {
            errors.push(field.id);
            return;
          }
        }
      }
    });

    return errors;
  };

  const scrollToFirstError = (errors: string[]) => {
    if (errors.length > 0) {
      const firstErrorElement = document.getElementById(`field-${errors[0]}`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // Focus the field for better UX
        const inputElement = firstErrorElement.querySelector('input, textarea, select') as HTMLElement;
        if (inputElement) {
          setTimeout(() => inputElement.focus(), 300);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate form before submission
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      setError(`Please fill in all required fields. Fields highlighted in red need attention.`);

      // Scroll to first error field
      scrollToFirstError(errors);
      return;
    }

    setValidationErrors([]);

    // Signature is optional for staff - they can submit forms without signature if needed
    // This allows flexibility for closing claims or partial submissions

    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/form-submissions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          jobId,
          formId,
          data: {
            ...formData,
            signature: signature,
            submissionTimestamp: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setHasBeenSubmitted(true);
        // Clear saved data on successful submission
        if (autoSaveKey) {
          localStorage.removeItem(autoSaveKey);
        }

        // Don't auto-navigate, allow user to submit again if needed
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        let errorMessage = "Failed to submit form";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response body can't be parsed as JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getFieldsBySection = (section: "staff" | "client") => {
    if (!form) return [];

    // Use section property if available, otherwise fallback to form-specific logic
    const fieldsWithSection = form.fields.some((field) => field.section);

    if (fieldsWithSection) {
      return form.fields.filter(
        (field) =>
          field.section === section || (!field.section && section === "staff"),
      );
    }

    // Fallback logic for forms without section markers
    if (form.name === "ABSA Form") {
      if (section === "staff") {
        return form.fields.filter((_, index) => index < 5 || index >= 13);
      } else {
        return form.fields.filter((_, index) => index >= 5 && index < 13);
      }
    } else if (form.name === "SAHL Certificate Form") {
      if (section === "staff") {
        return form.fields.filter((_, index) => index < 5 || index >= 11);
      } else {
        return form.fields.filter((_, index) => index >= 5 && index < 11);
      }
    } else if (form.name === "Clearance Certificate") {
      if (section === "staff") {
        return form.fields.filter((_, index) => index < 4 || index >= 10);
      } else {
        return form.fields.filter((_, index) => index >= 4 && index < 10);
      }
    }

    return form.fields;
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || "";
    const hasValidationError = validationErrors.includes(field.id);

    // Hide signature fields but keep them in the DOM for functionality
    const isSignatureField = field.type === 'signature' ||
                           field.id.toLowerCase().includes('signature') ||
                           field.id.toLowerCase().includes('sign') ||
                           field.label.toLowerCase().includes('signature') ||
                           field.label.toLowerCase().includes('sign');

    // Handle conditional fields
    if (field.dependsOn && field.showWhen) {
      const dependentValue = formData[field.dependsOn];
      if (dependentValue !== field.showWhen) {
        return null;
      }
    }

    const isAutoFilled = field.autoFillFrom && value;
    const isReadonly = field.readonly || isAutoFilled;

    return (
      <div key={field.id} id={`field-${field.id}`} className={`space-y-2 ${isSignatureField ? 'hidden' : ''}`}>
        <Label
          htmlFor={field.id}
          className={`${
            isAutoFilled ? "text-green-700" :
            hasValidationError ? "text-red-600 font-medium" : ""
          }`}
        >
          {field.label}{field.required ? ' *' : ''}
          {hasValidationError && (
            <span className="text-red-500 text-xs ml-2">
              {field.type === 'number' && '(Enter a valid number)' ||
               field.type === 'email' && '(Enter a valid email)' ||
               field.type === 'tel' && '(Enter a valid phone number)' ||
               '(This field is required)'}
            </span>
          )}
        </Label>

        {isAutoFilled ? (
          <div className="p-2 bg-green-50 border border-green-200 rounded-md">
            <span className="text-green-800 font-medium">{value}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              Auto-filled
            </Badge>
          </div>
        ) : field.type === "textarea" ? (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => {
              handleFieldChange(field.id, e.target.value);
              if (hasValidationError) {
                setValidationErrors(prev => prev.filter(id => id !== field.id));
              }
            }}
            placeholder={field.placeholder}
            required={false}
            readOnly={isReadonly}
            className={hasValidationError ? "border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500" : ""}
          />
        ) : field.type === "select" ? (
          <Select
            value={value}
            onValueChange={(val) => {
              handleFieldChange(field.id, val);
              if (hasValidationError) {
                setValidationErrors(prev => prev.filter(id => id !== field.id));
              }
            }}
            disabled={isReadonly}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value}
              onChange={(e) => {
                handleFieldChange(field.id, e.target.checked);
                if (hasValidationError) {
                  setValidationErrors(prev => prev.filter(id => id !== field.id));
                }
              }}
              className={`rounded border-gray-300 ${hasValidationError ? 'border-yellow-500' : ''}`}
              disabled={isReadonly}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => {
              handleFieldChange(field.id, e.target.value);
              if (hasValidationError) {
                setValidationErrors(prev => prev.filter(id => id !== field.id));
              }
            }}
            placeholder={field.placeholder}
            required={false}
            readOnly={isReadonly}
            className={hasValidationError ? "border-red-500 border-2 bg-red-50 focus:border-red-500 focus:ring-red-500" : ""}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentFields = getFieldsBySection(currentSection);
  const staffFields = getFieldsBySection("staff");
  const clientFields = getFieldsBySection("client");

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto mobile-safe-area">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => {
                // Navigate back to staff dashboard with state to open Fill Forms modal
                navigate('/', {
                  state: {
                    openFillForms: true,
                    jobId: jobId,
                    fromFormFill: true
                  }
                });
              }}
              className="text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // Navigate to staff dashboard
                navigate('/');
              }}
              className="text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fill Form</h1>
              <p className="text-gray-600">{form?.name || "Form"}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`flex items-center space-x-2 ${currentSection === "staff" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSection === "staff" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium">Staff</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div
              className={`flex items-center space-x-2 ${currentSection === "client" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSection === "client" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="font-medium">Client</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div
              className={`flex items-center space-x-2 ${currentSection === "signature" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSection === "signature" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                <Check className="h-4 w-4" />
              </div>
              <span className="font-medium">Sign</span>
            </div>
          </div>
        </div>

        {/* Job Information Card */}
        {job && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {job.title}
                </div>
                <div>
                  <span className="font-medium">Client:</span>{" "}
                  {job.insuredName || job.InsuredName || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Claim No:</span>{" "}
                  {job.claimNo || job.ClaimNo || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Policy No:</span>{" "}
                  {job.policyNo || job.PolicyNo || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {job.riskAddress || job.RiskAddress || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Staff:</span>{" "}
                  {staff.find((s) => s.id === job.assignedTo)?.name ||
                    "Unassigned"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button - Shows at top when signature is captured */}
        {currentSection === "signature" && signature && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium text-green-800">Ready to Submit</div>
                    <div className="text-sm text-green-600">
                      Staff: {staff.find((s) => s.id === job?.assignedTo)?.name || user?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {hasBeenSubmitted ? "Submit Again" : "Submit Form"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-save Indicator */}
        {currentSection !== "signature" && (
          <div className="mb-4 text-sm text-gray-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Form data is automatically saved as you type
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Form submitted successfully! Redirecting to home page...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Required fields missing:</strong> Please fill in all fields marked with red highlighting to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Section Instructions */}
        {currentSection === "client" && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Hand phone to client:</strong> Let the client fill out
              this section and provide their signature.
            </AlertDescription>
          </Alert>
        )}

        {/* Custom Form Components for Core Forms */}
        {form && formId === "noncompliance-form" && job && (
          <NoncomplianceForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "material-list-form" && job && (
          <MaterialListForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "liability-form" && job && (
          <EnhancedLiabilityForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "clearance-certificate-form" && job && (
          <ClearanceCertificateForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "sahl-certificate-form" && job && (
          <SAHLCertificateForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "absa-form" && job && (
          <ABSAForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {form && formId === "discovery-form" && job && (
          <DiscoveryForm
            job={job}
            assignedStaff={staff.find(s => s.id === job.assignedTo) || null}
            onSubmit={async (formData) => {
              setSaving(true);
              try {
                const token = localStorage.getItem("auth_token");
                const headers: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch("/api/form-submissions", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    jobId,
                    formId,
                    data: formData,
                  }),
                });

                if (response.ok) {
                  handleSuccessfulSubmission();
                } else {
                  let errorMessage = "Failed to submit form";
                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                  }
                  setError(errorMessage);
                }
              } catch (error) {
                setError("Network error occurred");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {/* Generic Form Section for other forms */}
        {form && ![
          "noncompliance-form",
          "material-list-form",
          "liability-form",
          "clearance-certificate-form",
          "sahl-certificate-form",
          "absa-form",
          "discovery-form"
        ].includes(formId || "") && currentSection !== "signature" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {currentSection === "staff"
                  ? "Staff"
                  : "Client"}
              </CardTitle>
              <p className="text-gray-600">
                {currentSection === "staff"
                  ? "Complete the staff portion of the form"
                  : "Client to complete this section"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentFields.map(renderField)}
                </div>

                <div className="flex justify-between pt-6 border-t">
                  {currentSection === "client" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackSection}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}

                  <div className="flex space-x-4 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                    >
                      Cancel
                    </Button>
                    {(() => {
                      // Core forms don't require signature
                      const coreFormIds = ["noncompliance-form", "material-list-form", "liability-form"];
                      const isCore = coreFormIds.some(id => form?.name?.toLowerCase().includes(id.replace("-form", "").replace("-", " ")));
                      const requiresSignature = form && !isCore && ["Clearance Certificate", "SAHL Certificate Form", "ABSA Form", "Discovery Form"].includes(form.name);

                      if (currentSection === "staff") {
                        // Only show "Hand to Client" for signature-required forms
                        if (requiresSignature) {
                          return (
                            <Button type="button" onClick={handleNextSection}>
                              Hand to Client
                              <Smartphone className="h-4 w-4 ml-2" />
                            </Button>
                          );
                        } else {
                          // For other forms, submit directly without signature
                          return (
                            <Button type="submit" disabled={saving}>
                              {saving ? "Submitting..." : hasBeenSubmitted ? "Submit Again" : "Submit Form"}
                              <Check className="h-4 w-4 ml-2" />
                            </Button>
                          );
                        }
                      } else {
                        // Client section - show "Get Signature" only for signature-required forms
                        if (requiresSignature) {
                          return (
                            <Button type="button" onClick={handleNextSection}>
                              Sign
                              <Smartphone className="h-4 w-4 ml-2" />
                            </Button>
                          );
                        } else {
                          // Should not reach here for non-signature forms
                          return null;
                        }
                      }
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature Section */}
        {currentSection === "signature" && !showSignaturePad && (
          <Card>
            <CardHeader>
              <CardTitle>Signature Required</CardTitle>
              <p className="text-gray-600">
                Client signature is required to complete the form
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {signature ? (
                  <div className="space-y-4">
                    <div className="text-green-600 font-medium text-lg">
                      ✓ Signature captured successfully
                    </div>
                    <img
                      src={signature}
                      alt="Client signature"
                      className="mx-auto border rounded-lg max-w-md shadow-sm"
                    />
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowSignaturePad(true)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Retake Signature
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      📝 Form is ready to submit. Use the Submit Form button at the top.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg">Ready for client signature</p>
                    <Button
                      onClick={() => setShowSignaturePad(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Open Signature Pad
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-start pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackSection}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Client Section
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Screen Signature Pad */}
      <FullScreenSignaturePad
        isOpen={showSignaturePad}
        onSignatureComplete={handleSignatureComplete}
        onCancel={() => setShowSignaturePad(false)}
        title="Client Signature Required"
      />
    </div>
  );
}
