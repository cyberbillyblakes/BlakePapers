import { RequestHandler } from "express";
import {
  Form,
  FormField,
  CreateFormRequest,
  FormSubmission,
} from "@shared/types";
import { predefinedForms, getAllPredefinedForms } from "./predefinedForms";
import { saveFormSubmissionToMongo } from "../utils/mongoDataAccess";

// Mock storage - in production, use a proper database
export let forms: Form[] = [...predefinedForms]; // Initialize with predefined forms

// Core forms with variable mappings
const coreForms: Form[] = [
  {
    id: "noncompliance-form",
    name: "Non Compliance Form",
    description: "Assessment form for non-compliance issues and geyser replacement",
    fields: [
      { id: "date", label: "Date", type: "date", required: false, autoFillFrom: "currentDate" },
      { id: "insuranceName", label: "Insurance Name", type: "text", required: false, autoFillFrom: "underwriter" },
      { id: "claimNumber", label: "Claim Number", type: "text", required: false, autoFillFrom: "claimNo" },
      { id: "clientName", label: "Client Name", type: "text", required: false, autoFillFrom: "insuredName" },
      { id: "clientSurname", label: "Client Surname", type: "text", required: false },
      { id: "installersName", label: "Installers Name", type: "text", required: false, autoFillFrom: "assignedStaffName" },
      { id: "quotationSupplied", label: "Quotation Supplied?", type: "select", options: ["Yes", "No"], required: false },
      { id: "plumberIndemnity", label: "Plumber Indemnity", type: "select", options: ["Electric geyser", "Solar geyser", "Heat pump", "Pipe Repairs", "Assessment"], required: false },
      { id: "geyserMake", label: "Geyser Make", type: "text", required: false },
      { id: "geyserSerial", label: "Geyser Serial", type: "text", required: false },
      { id: "geyserCode", label: "Geyser Code", type: "text", required: false },
      { id: "selectedIssues", label: "Selected Compliance Issues", type: "checkbox", required: false }
    ],
    isTemplate: false,
    pdfTemplate: "Noncompliance.pdf",
    formType: "assessment",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "material-list-form",
    name: "Material List Form",
    description: "Comprehensive material list for geyser installation projects",
    fields: [
      { id: "date", label: "Date", type: "date", required: false, autoFillFrom: "currentDate" },
      { id: "plumber", label: "Plumber Name", type: "text", required: false, autoFillFrom: "assignedStaffName" },
      { id: "claimNumber", label: "Claim Number", type: "text", required: false, autoFillFrom: "claimNo" },
      { id: "insurance", label: "Insurance Company", type: "text", required: false, autoFillFrom: "underwriter" },
      { id: "geyserSize", label: "Geyser Size", type: "select", options: ["50L", "100L", "150L", "200L", "250L", "300L"], required: false },
      { id: "geyserBrand", label: "Geyser Brand", type: "select", options: ["Kwikot", "Heat Tech", "Techron", "Other"], required: false },
      { id: "dripTraySize", label: "Drip Tray Size", type: "text", required: false },
      { id: "vacuumBreaker1", label: "Vacuum Breaker 1", type: "text", required: false },
      { id: "vacuumBreaker2", label: "Vacuum Breaker 2", type: "text", required: false },
      { id: "pressureControlValve", label: "Pressure Control Valve", type: "text", required: false },
      { id: "nonReturnValve", label: "Non Return Valve", type: "text", required: false },
      { id: "fogiPack", label: "Fogi Pack", type: "text", required: false },
      { id: "additionalMaterials", label: "Additional Materials", type: "textarea", required: false }
    ],
    isTemplate: false,
    pdfTemplate: "ML.pdf",
    formType: "materials",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "liability-form",
    name: "Liability Form",
    description: "Enhanced liability waiver form with comprehensive assessment",
    fields: [
      { id: "date", label: "Date", type: "date", required: false, autoFillFrom: "currentDate" },
      { id: "insurance", label: "Insurance", type: "text", required: false, autoFillFrom: "underwriter" },
      { id: "claimNumber", label: "Claim Number", type: "text", required: false, autoFillFrom: "claimNo" },
      { id: "client", label: "Client", type: "text", required: false, autoFillFrom: "insuredName" },
      { id: "plumber", label: "Plumber", type: "text", required: false, autoFillFrom: "assignedStaffName" },
      { id: "wasExcessPaid", label: "Was Excess Paid?", type: "select", options: ["yes", "no"], required: false },
      { id: "selectedAssessmentItems", label: "Assessment Items", type: "checkbox", required: false },
      { id: "waterHammerBefore", label: "Water Hammer Before", type: "text", required: false },
      { id: "waterHammerAfter", label: "Water Hammer After", type: "text", required: false },
      { id: "pressureTestBefore", label: "Pressure Test Before", type: "text", required: false },
      { id: "pressureTestAfter", label: "Pressure Test After", type: "text", required: false },
      { id: "thermostatSettingBefore", label: "Thermostat Setting Before", type: "text", required: false },
      { id: "thermostatSettingAfter", label: "Thermostat Setting After", type: "text", required: false },
      { id: "pipeInstallation", label: "Pipe Installation Quality", type: "select", options: ["excellent", "good", "acceptable", "poor", "not-applicable"], required: false },
      { id: "pipeInsulation", label: "Pipe Insulation", type: "select", options: ["adequate", "inadequate", "missing", "not-required"], required: false },
      { id: "pressureRegulation", label: "Pressure Regulation", type: "select", options: ["within-limits", "too-high", "too-low", "not-tested"], required: false },
      { id: "temperatureControl", label: "Temperature Control", type: "select", options: ["functioning", "erratic", "not-functioning", "needs-adjustment"], required: false },
      { id: "safetyCompliance", label: "Safety Compliance", type: "select", options: ["compliant", "minor-issues", "major-issues", "non-compliant"], required: false },
      { id: "workmanshipQuality", label: "Workmanship Quality", type: "select", options: ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"], required: false },
      { id: "materialStandards", label: "Material Standards", type: "select", options: ["sabs-approved", "iso-certified", "non-standard", "unknown"], required: false },
      { id: "installationCertificate", label: "Installation Certificate", type: "select", options: ["issued", "pending", "not-required", "rejected"], required: false },
      { id: "additionalComments", label: "Additional Comments", type: "textarea", required: false }
    ],
    isTemplate: false,
    pdfTemplate: "liabWave.pdf",
    formType: "liability",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clearance-certificate-form",
    name: "Clearance Certificate Form",
    description: "BBP clearance certificate for geyser installations",
    fields: [
      { id: "cname", label: "Client Name", type: "text", required: false, autoFillFrom: "insuredName" },
      { id: "cref", label: "Claim Reference", type: "text", required: false, autoFillFrom: "claimNo" },
      { id: "caddress", label: "Client Address", type: "text", required: false, autoFillFrom: "riskAddress" },
      { id: "cdamage", label: "Cause of Damage", type: "text", required: false },
      { id: "gcomments", label: "General Comments", type: "textarea", required: false },
      { id: "scopework", label: "Scope of Work", type: "textarea", required: false },
      { id: "oldgeyser", label: "Old Geyser", type: "select", options: ["150L", "200L", "250L", "300L", "Other"], required: false },
      { id: "newgeyser", label: "New Geyser", type: "select", options: ["150L", "200L", "250L", "300L", "Other"], required: false },
      { id: "staff", label: "Staff Member", type: "text", required: false, autoFillFrom: "assignedStaffName" },
      { id: "cquality1", label: "Quality Check 1", type: "select", options: ["Yes", "No"], required: false },
      { id: "cquality2", label: "Quality Check 2", type: "select", options: ["Yes", "No"], required: false },
      { id: "cquality3", label: "Quality Check 3", type: "select", options: ["Yes", "No"], required: false },
      { id: "cquality4", label: "Quality Check 4", type: "select", options: ["Yes", "No"], required: false },
      { id: "cquality5", label: "Quality Check 5", type: "select", options: ["Yes", "No"], required: false },
      { id: "cquality6", label: "Workmanship Rating", type: "select", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], required: false },
      { id: "excess", label: "Excess Paid", type: "select", options: ["Yes", "No"], required: false },
      { id: "amount", label: "Excess Amount", type: "text", required: false }
    ],
    isTemplate: false,
    pdfTemplate: "BBPClearanceCertificate.pdf",
    formType: "certificate",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize forms with PDF forms included
async function initializeForms() {
  try {
    const allForms = await getAllPredefinedForms();
    // Merge core forms with existing forms, giving priority to core forms
    const existingFormIds = allForms.map((f: any) => f.id);
    const newCoreForms = coreForms.filter(cf => !existingFormIds.includes(cf.id));
    forms = [...allForms, ...newCoreForms];
  } catch (error) {
    console.error("Error initializing forms with PDF forms:", error);
    // Fallback to core forms plus legacy forms
    const existingFormIds = predefinedForms.map((f: any) => f.id);
    const newCoreForms = coreForms.filter(cf => !existingFormIds.includes(cf.id));
    forms = [...predefinedForms, ...newCoreForms];
  }
}

// Initialize on module load
initializeForms();
export let formSubmissions: FormSubmission[] = [];

// Reset all form submissions on startup
formSubmissions.length = 0;
let formIdCounter = predefinedForms.length + 1;
let submissionIdCounter = 1;

// Initialize form submissions from MongoDB
async function initializeFormSubmissions() {
  try {
    // Import MongoDB models
    const { connectToDatabase } = await import("../utils/mongodb");
    const { FormSubmission: MongoFormSubmission } = await import("../models");

    await connectToDatabase();

    // Load existing form submissions from MongoDB
    const existingSubmissions = await MongoFormSubmission.find({}).sort({
      submittedAt: -1,
    });

    if (existingSubmissions.length > 0) {
      formSubmissions = existingSubmissions.map((submission: any) => ({
        id: submission.id,
        jobId: submission.jobId,
        formId: submission.formId,
        formType: submission.formType || "standard",
        data: submission.data,
        signature: submission.signature,
        submittedBy: submission.submittedBy,
        submittedAt: submission.submittedAt,
      }));

      // Update counter to avoid ID conflicts
      submissionIdCounter =
        Math.max(
          ...formSubmissions.map(
            (fs) => parseInt(fs.id.replace("submission-", "")) || 0,
          ),
        ) + 1;

      console.log(
        `Loaded ${formSubmissions.length} form submissions from MongoDB`,
      );
    }
  } catch (error) {
    console.error("Error initializing form submissions from MongoDB:", error);
    // Continue with empty array as fallback
  }
}

// Initialize form submissions
initializeFormSubmissions();

// Schema parser for form creation
function parseFormSchema(schema: string): Omit<FormField, "id">[] {
  const fields: Omit<FormField, "id">[] = [];

  // Split by lines and clean
  const lines = schema
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    // Skip headers or obvious non-field lines
    if (
      line.includes("Details") ||
      line.includes("Notification") ||
      line.includes("Appointment")
    ) {
      continue;
    }

    // Check if line contains a field pattern (word followed by tab/colon and value)
    const fieldMatch = line.match(/^([^:\t]+)[\t:]\s*(.*)$/);

    if (fieldMatch) {
      const label = fieldMatch[1].trim();
      const sampleValue = fieldMatch[2].trim();

      let fieldType: FormField["type"] = "text";
      let required = true;

      // Determine field type based on label and sample value
      if (label.toLowerCase().includes("email")) {
        fieldType = "email";
      } else if (
        label.toLowerCase().includes("date") ||
        sampleValue.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) ||
        sampleValue.match(/\d{1,2}\s+\w+\s+\d{4}/)
      ) {
        fieldType = "date";
      } else if (
        label.toLowerCase().includes("amount") ||
        label.toLowerCase().includes("sum") ||
        label.toLowerCase().includes("estimate") ||
        sampleValue.match(/^\d+\.?\d*$/)
      ) {
        fieldType = "number";
      } else if (
        label.toLowerCase().includes("description") ||
        label.toLowerCase().includes("address") ||
        sampleValue.length > 50
      ) {
        fieldType = "textarea";
      } else if (
        label.toLowerCase().includes("status") ||
        label.toLowerCase().includes("section") ||
        label.toLowerCase().includes("peril")
      ) {
        fieldType = "select";
      }

      fields.push({
        type: fieldType,
        label,
        required,
        placeholder: fieldType === "select" ? undefined : `Enter ${label}`,
        options:
          fieldType === "select"
            ? ["Current", "Pending", "Completed"]
            : undefined,
      });
    }
  }

  return fields;
}

export const handleCreateForm: RequestHandler = (req, res) => {
  try {
    const formData: CreateFormRequest = req.body;

    if (!formData.name) {
      return res.status(400).json({ error: "Form name is required" });
    }

    let fields = formData.fields;

    // Parse schema if provided
    if (formData.rawSchema) {
      const parsedFields = parseFormSchema(formData.rawSchema);
      if (parsedFields.length > 0) {
        fields = parsedFields;
      }
    }

    // Add IDs to fields
    const fieldsWithIds: FormField[] = fields.map((field, index) => ({
      ...field,
      id: `field-${formIdCounter}-${index + 1}`,
    }));

    const newForm: Form = {
      id: `form-${formIdCounter++}`,
      name: formData.name,
      description: formData.description,
      fields: fieldsWithIds,
      isTemplate: formData.isTemplate,
      restrictedToCompanies: formData.restrictedToCompanies || [],
      createdBy: "admin-1", // Mock admin user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    forms.push(newForm);
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetForms: RequestHandler = (req, res) => {
  try {
    const { isTemplate, companyId } = req.query;

    let filteredForms = forms;

    if (isTemplate !== undefined) {
      filteredForms = filteredForms.filter(
        (form) => form.isTemplate === (isTemplate === "true"),
      );
    }

    if (companyId) {
      filteredForms = filteredForms.filter(
        (form) =>
          form.restrictedToCompanies.length === 0 ||
          form.restrictedToCompanies.includes(companyId as string),
      );
    }

    res.json(filteredForms);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetForm: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const form = forms.find((f) => f.id === id);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleUpdateForm: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const formIndex = forms.findIndex((form) => form.id === id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Form not found" });
    }

    forms[formIndex] = {
      ...forms[formIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    res.json(forms[formIndex]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleSubmitForm: RequestHandler = async (req, res) => {
  try {
    const { jobId, formId, data, signature } = req.body;

    if (!jobId || !formId || !data) {
      return res.status(400).json({
        error: "jobId, formId, and data are required",
      });
    }

    // Get user from token
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = token ? token.replace("mock-token-", "") : "admin-1";

    // Check existing submissions for this job/form combination
    const existingSubmissions = formSubmissions.filter(
      (sub) =>
        sub.jobId === jobId &&
        sub.formId === formId &&
        sub.submittedBy === userId,
    );

    // No submission limits for staff - they can submit as many times as needed
    // This allows staff to close claims or fill forms without restrictions

    // Determine submission number (1, 2, or 3)
    const submissionNumber = existingSubmissions.length + 1;

    const submission: FormSubmission = {
      id: `submission-${submissionIdCounter++}`,
      jobId,
      formId,
      submittedBy: userId,
      data,
      submittedAt: new Date().toISOString(),
      submissionNumber,
      signature,
    };

    formSubmissions.push(submission);

    // Save to MongoDB
    try {
      await saveFormSubmissionToMongo(submission);
    } catch (mongoError) {
      console.error("Failed to sync form submission to MongoDB:", mongoError);
      // Continue with local storage as fallback
    }

    res.status(201).json({
      ...submission,
      message: `Form submitted successfully (submission ${submissionNumber}/3)`,
      remainingSubmissions: 3 - submissionNumber,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetFormSubmissions: RequestHandler = (req, res) => {
  try {
    const { jobId, formId, submittedBy } = req.query;

    let filteredSubmissions = formSubmissions;

    if (jobId) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) => sub.jobId === jobId,
      );
    }

    if (formId) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) => sub.formId === formId,
      );
    }

    if (submittedBy) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) => sub.submittedBy === submittedBy,
      );
    }

    res.json(filteredSubmissions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDeleteForm: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin (simple check for mock implementation)
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = token ? token.replace("mock-token-", "") : "";

    if (userId !== "admin-1") {
      return res
        .status(403)
        .json({ error: "Only administrators can delete forms" });
    }

    const formIndex = forms.findIndex((form) => form.id === id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Remove the form
    forms.splice(formIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleParseFormSchema: RequestHandler = (req, res) => {
  try {
    const { schema } = req.body;

    if (!schema) {
      return res.status(400).json({ error: "Schema is required" });
    }

    const fields = parseFormSchema(schema);
    res.json({ fields });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a specific form submission
export const handleUpdateFormSubmission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check user permissions
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = token ? token.replace("mock-token-", "") : "";

    const submissionIndex = formSubmissions.findIndex(sub => sub.id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({ error: "Form submission not found" });
    }

    const submission = formSubmissions[submissionIndex];

    // Allow admins to edit any submission, or staff to edit their own material list submissions
    const isAdmin = userId === "admin-1";
    const isStaffOwner = submission.submittedBy === userId;
    const isMaterialListForm = submission.formId === "material-list-form";

    if (!isAdmin && !(isStaffOwner && isMaterialListForm)) {
      return res.status(403).json({
        error: "You can only edit your own material list submissions"
      });
    }

    // Update the submission
    const updatedSubmission = {
      ...submission,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    formSubmissions[submissionIndex] = updatedSubmission;

    // Update in MongoDB if available
    try {
      const { connectToDatabase } = await import("../utils/mongodb");
      const { FormSubmission: MongoFormSubmission } = await import("../models");

      await connectToDatabase();
      await MongoFormSubmission.findOneAndUpdate(
        { id: id },
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
          updatedBy: userId
        }
      );
    } catch (mongoError) {
      console.warn("Could not update form submission in MongoDB:", mongoError);
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error("Error updating form submission:", error);
    res.status(500).json({ error: "Failed to update form submission" });
  }
};

// Delete a specific form submission
export const handleDeleteFormSubmission: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = token ? token.replace("mock-token-", "") : "";

    if (userId !== "admin-1") {
      return res.status(403).json({ error: "Only administrators can delete form submissions" });
    }

    const submissionIndex = formSubmissions.findIndex(sub => sub.id === id);

    if (submissionIndex === -1) {
      return res.status(404).json({ error: "Form submission not found" });
    }

    const deletedSubmission = formSubmissions[submissionIndex];

    // Remove from local array
    formSubmissions.splice(submissionIndex, 1);

    // Delete from MongoDB if available
    try {
      const { connectToDatabase } = await import("../utils/mongodb");
      const { FormSubmission: MongoFormSubmission } = await import("../models");

      await connectToDatabase();
      await MongoFormSubmission.findOneAndDelete({ id: id });
    } catch (mongoError) {
      console.warn("Could not delete form submission from MongoDB:", mongoError);
    }

    res.json({
      success: true,
      message: "Form submission deleted successfully",
      deletedSubmission
    });
  } catch (error) {
    console.error("Error deleting form submission:", error);
    res.status(500).json({ error: "Failed to delete form submission" });
  }
};

// Clear all form submissions data
export const handleClearAllFormSubmissions: RequestHandler = async (req, res) => {
  try {
    // Store current count for response
    const currentCount = formSubmissions.length;

    // Clear local array
    formSubmissions.length = 0;

    // Clear MongoDB data
    try {
      const { connectToDatabase } = await import("../utils/mongodb");
      const { FormSubmission: MongoFormSubmission } = await import("../models");

      await connectToDatabase();
      const deleteResult = await MongoFormSubmission.deleteMany({});
      console.log(`Cleared ${deleteResult.deletedCount} form submissions from MongoDB`);
    } catch (mongoError) {
      console.error("Failed to clear form submissions from MongoDB:", mongoError);
    }

    // Reset submission counter
    submissionIdCounter = 1;

    res.json({
      success: true,
      message: "All form submissions have been cleared successfully",
      clearedCount: currentCount,
    });
  } catch (error) {
    console.error("Error clearing form submissions:", error);
    res.status(500).json({ error: "Failed to clear form submissions" });
  }
};
