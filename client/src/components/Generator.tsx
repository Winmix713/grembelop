import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  ChangeEvent,
  KeyboardEvent,
  FocusEvent,
} from "react";

import {
  Upload,
  Link,
  Play,
  Download,
  Eye,
  Code2,
  RefreshCcw,
  AlertTriangle,
  Info,
} from "lucide-react";

type Framework =
  | "React + TypeScript"
  | "React + JavaScript"
  | "Vue.js"
  | "HTML + CSS";

type CssFramework =
  | "Tailwind CSS"
  | "CSS Modules"
  | "Styled Components"
  | "Plain CSS";

interface GeneratorFormData {
  figmaUrl: string;
  apiToken: string;
  framework: Framework;
  cssFramework: CssFramework;
  file?: File;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}

const ResultsPanel = lazy(() => import("./ResultsPanel")); // Lazy load example (stub)
const CodePreview = lazy(() => import("./CodePreview")); // Lazy load example (stub)

// Debounce helper
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Custom hook for file upload, validation and drag & drop
function useFileUpload(
  onFileChange: (file: File) => void,
  maxFileSizeMB = 10,
  acceptedTypes = [".fig"]
) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!acceptedTypes.some((type) => type.replace(".", "") === ext)) {
      return `Csak ${acceptedTypes.join(", ")} fájlok engedélyezettek.`;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return `A fájl mérete nem lehet nagyobb mint ${maxFileSizeMB} MB.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    setFileError(error);
    if (!error) onFileChange(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return {
    dragActive,
    fileError,
    onInputChange,
    onDragEnter,
    onDragLeave,
    onDrop,
  };
}

// Custom hook for code generation simulation with multi-step progress and error handling
function useCodeGeneration(
  formData: GeneratorFormData,
  onComplete: () => void
): [ProcessingState, () => void, () => void] {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: "",
    error: undefined,
  });

  const steps = useMemo(
    () => [
      { step: "Parsing design...", duration: 1000 },
      { step: "Analyzing components...", duration: 1500 },
      { step: "Generating code...", duration: 2000 },
    ],
    []
  );

  const startProcessing = useCallback(() => {
    if (processingState.isProcessing) return;

    setProcessingState({
      isProcessing: true,
      progress: 0,
      currentStep: steps[0].step,
      error: undefined,
    });

    let currentStepIndex = 0;
    let progressInterval: ReturnType<typeof setInterval>;

    const runStep = () => {
      if (currentStepIndex >= steps.length) {
        setProcessingState((prev) => ({
          ...prev,
          progress: 100,
          currentStep: "Completed",
          isProcessing: false,
        }));
        onComplete();
        clearInterval(progressInterval);
        return;
      }

      const { step, duration } = steps[currentStepIndex];
      setProcessingState((prev) => ({
        ...prev,
        currentStep: step,
      }));

      let startTime = Date.now();

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stepProgress = Math.min((elapsed / duration) * 100, 100);
        setProcessingState((prev) => ({
          ...prev,
          progress:
            (currentStepIndex * 100) / steps.length +
            (stepProgress / steps.length),
        }));
        if (stepProgress >= 100) {
          clearInterval(progressInterval);
          currentStepIndex++;
          runStep();
        }
      }, 100);
    };

    runStep();
  }, [processingState.isProcessing, onComplete, steps]);

  const resetProcessing = () => {
    setProcessingState({
      isProcessing: false,
      progress: 0,
      currentStep: "",
      error: undefined,
    });
  };

  return [processingState, startProcessing, resetProcessing];
}

// Validation helpers
const validateUrl = (url: string): string | null => {
  try {
    if (!url) return "A Figma URL megadása kötelező.";
    const parsed = new URL(url);
    if (!parsed.hostname.includes("figma.com"))
      return "Csak figma.com URL-ek elfogadottak.";
    return null;
  } catch {
    return "Érvénytelen URL formátum.";
  }
};

const validateToken = (token: string): string | null => {
  if (!token) return "API token megadása kötelező.";
  if (!token.startsWith("figd_")) return "Érvénytelen token formátum.";
  return null;
};

export function Generator() {
  // Tabs: 'upload' or 'link'
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");

  // Form data + file
  const [formData, setFormData] = useState<GeneratorFormData>({
    figmaUrl: "",
    apiToken: "",
    framework: "React + TypeScript",
    cssFramework: "Tailwind CSS",
    file: undefined,
  });

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof GeneratorFormData, string>>>({});

  // Loading states for UX
  const [loadingStates, setLoadingStates] = useState({
    uploading: false,
    processing: false,
    generating: false,
  });

  // File upload hook
  const {
    dragActive,
    fileError,
    onInputChange,
    onDragEnter,
    onDragLeave,
    onDrop,
  } = useFileUpload((file) => {
    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: undefined }));
  });

  // Code generation hook
  const [processingState, startProcessing, resetProcessing] = useCodeGeneration(
    formData,
    () => {
      setLoadingStates((prev) => ({ ...prev, generating: false }));
    }
  );

  // Debounced validation for URL and token
  const debouncedValidateForm = useMemo(() => {
    return debounce(() => {
      const newErrors: typeof errors = {};

      if (activeTab === "link") {
        const urlError = validateUrl(formData.figmaUrl);
        if (urlError) newErrors.figmaUrl = urlError;

        const tokenError = validateToken(formData.apiToken);
        if (tokenError) newErrors.apiToken = tokenError;
      } else if (activeTab === "upload") {
        if (!formData.file) newErrors.file = "Fájl feltöltése kötelező.";
      }

      setErrors(newErrors);
    }, 500);
  }, [activeTab, formData.figmaUrl, formData.apiToken, formData.file]);

  useEffect(() => {
    debouncedValidateForm();
  }, [debouncedValidateForm]);

  // Handle form field changes
  const onInputChangeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  // Keyboard accessibility for tabs
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tab: "upload" | "link") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  // Check if form is valid for enabling generate button
  const isFormValid = useMemo(() => {
    if (activeTab === "upload") {
      return formData.file && !errors.file;
    }
    if (activeTab === "link") {
      return (
        formData.figmaUrl &&
        formData.apiToken &&
        !errors.figmaUrl &&
        !errors.apiToken
      );
    }
    return false;
  }, [activeTab, formData, errors]);

  // Handle generate button click
  const handleGenerate = () => {
    if (!isFormValid) return;

    setLoadingStates((prev) => ({ ...prev, generating: true }));
    resetProcessing();
    startProcessing();
  };

  // Save form data to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem("generatorFormData", JSON.stringify(formData));
    } catch {
      // localStorage might be disabled
    }
  }, [formData]);

  // Load saved form data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("generatorFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore errors
    }
  }, []);

  // Memoized options for selects
  const frameworkOptions = useMemo<Framework[]>(() => [
    "React + TypeScript",
    "React + JavaScript",
    "Vue.js",
    "HTML + CSS",
  ], []);

  const cssFrameworkOptions = useMemo<CssFramework[]>(() => [
    "Tailwind CSS",
    "CSS Modules",
    "Styled Components",
    "Plain CSS",
  ], []);

  return (
    <section className="py-20 px-6" aria-label="Figma design generátor">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Try the Generator</h2>
          <p className="text-xl text-gray-600">
            Upload your Figma design or paste a link to generate production-ready code
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div
            className="flex border-b border-gray-200"
            role="tablist"
            aria-label="Fájl feltöltés vagy link megadás választása"
          >
            <button
              id="upload-tab"
              role="tab"
              aria-selected={activeTab === "upload"}
              aria-controls="upload-panel"
              tabIndex={activeTab === "upload" ? 0 : -1}
              onClick={() => setActiveTab("upload")}
              onKeyDown={(e) => onTabKeyDown(e, "upload")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "upload"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
              Upload File
            </button>

            <button
              id="link-tab"
              role="tab"
              aria-selected={activeTab === "link"}
              aria-controls="link-panel"
              tabIndex={activeTab === "link" ? 0 : -1}
              onClick={() => setActiveTab("link")}
              onKeyDown={(e) => onTabKeyDown(e, "link")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === "link"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Link className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />
              Figma Link
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-8">
            {activeTab === "upload" && (
              <div
                id="upload-panel"
                role="tabpanel"
                aria-labelledby="upload-tab"
                tabIndex={0}
                onDragEnter={onDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 ${
                  dragActive ? "border-blue-400" : "border-gray-300"
                } border-dashed rounded-xl p-12 text-center transition-colors`}
              >
                <input
                  type="file"
                  id="file-upload"
                  name="file"
                  accept=".fig"
                  className="hidden"
                  onChange={onInputChange}
                  aria-describedby="file-upload-error"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your Figma file here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Or click to browse and select a <code>.fig</code> file
                  </p>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Choose File
                  </button>
                </label>
                {(fileError || errors.file) && (
                  <p
                    className="mt-2 text-sm text-red-600"
                    id="file-upload-error"
                    role="alert"
                  >
                    <AlertTriangle className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    {fileError || errors.file}
                  </p>
                )}
                {formData.file && !fileError && (
                  <p className="mt-2 text-sm text-gray-700" aria-live="polite">
                    Fájl kiválasztva: <strong>{formData.file.name}</strong> (
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {activeTab === "link" && (
              <form
                id="link-panel"
                role="tabpanel"
                aria-labelledby="link-tab"
                tabIndex={0}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isFormValid) handleGenerate();
                }}
                noValidate
              >
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="figmaUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Figma File URL{" "}
                      <Info
                        className="inline w-4 h-4 text-gray-400"
                        title="Csak figma.com URL-ek fogadhatók el."
                        aria-label="Információ a Figma URL-ről"
                      />
                    </label>
                    <input
                      id="figmaUrl"
                      name="figmaUrl"
                      type="url"
                      value={formData.figmaUrl}
                      onChange={onInputChangeHandler}
                      placeholder="https://www.figma.com/file/..."
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.figmaUrl ? "border-red-600" : "border-gray-300"
                      }`}
                      aria-describedby="figmaUrl-error"
                      aria-invalid={!!errors.figmaUrl}
                      required
                    />
                    {errors.figmaUrl && (
                      <p
                        className="mt-1 text-sm text-red-600"
                        id="figmaUrl-error"
                        role="alert"
                      >
                        <AlertTriangle className="inline w-4 h-4 mr-1" aria-hidden="true" />
                        {errors.figmaUrl}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="apiToken"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Figma API Token{" "}
                      <Info
                        className="inline w-4 h-4 text-gray-400"
                        title="Get your token from Figma → Account Settings → Personal Access Tokens"
                        aria-label="Információ az API token beszerzéséről"
                      />
                    </label>
                    <input
                      id="apiToken"
                      name="apiToken"
                      type="password"
                      value={formData.apiToken}
                      onChange={onInputChangeHandler}
                      placeholder="figd_..."
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.apiToken ? "border-red-600" : "border-gray-300"
                      }`}
                      aria-describedby="apiToken-error"
                      aria-invalid={!!errors.apiToken}
                      required
                    />
                    {errors.apiToken && (
                      <p
                        className="mt-1 text-sm text-red-600"
                        id="apiToken-error"
                        role="alert"
                      >
                        <AlertTriangle className="inline w-4 h-4 mr-1" aria-hidden="true" />
                        {errors.apiToken}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Get your token from Figma → Account Settings → Personal Access Tokens
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* Configuration Options */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Output Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="framework"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Framework
                    <Info
                      className="inline w-4 h-4 text-gray-400 ml-1"
                      title="Válassza ki a kívánt frontend keretrendszert."
                      aria-label="Információ a framework választásról"
                    />
                  </label>
                  <select
                    id="framework"
                    name="framework"
                    value={formData.framework}
                    onChange={onInputChangeHandler}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {frameworkOptions.map((fw) => (
                      <option key={fw} value={fw}>
                        {fw}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cssFramework"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    CSS Framework
                    <Info
                      className="inline w-4 h-4 text-gray-400 ml-1"
                      title="Válassza ki a kívánt CSS megoldást."
                      aria-label="Információ a CSS framework választásról"
                    />
                  </label>
                  <select
                    id="cssFramework"
                    name="cssFramework"
                    value={formData.cssFramework}
                    onChange={onInputChangeHandler}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {cssFrameworkOptions.map((cssFw) => (
                      <option key={cssFw} value={cssFw}>
                        {cssFw}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              {!processingState.isProcessing ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isFormValid}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 ${
                    !isFormValid
                      ? "opacity-50 cursor-not-allowed hover:shadow-none"
                      : ""
                  }`}
                  aria-disabled={!isFormValid}
                  aria-live="polite"
                >
                  <Play className="w-5 h-5" aria-hidden="true" />
                  <span>Generate Code</span>
                </button>
              ) : (
                <div className="space-y-4" aria-live="polite" aria-atomic="true">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${processingState.progress}%` }}
                    />
                  </div>
                  <p className="text-center text-gray-600">{processingState.currentStep} ({Math.round(processingState.progress)}%)</p>
                </div>
              )}
              {processingState.error && (
                <div
                  className="mt-4 p-4 bg-red-100 text-red-700 rounded flex items-center space-x-2"
                  role="alert"
                >
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  <span>{processingState.error}</span>
                  <button
                    onClick={() => {
                      resetProcessing();
                      setLoadingStates((prev) => ({ ...prev, generating: false }));
                    }}
                    aria-label="Próbálja újra a generálást"
                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    <RefreshCcw className="w-4 h-4 inline" />
                    Újrapróbálkozás
                  </button>
                </div>
              )}
            </div>

            {/* Results (shown when processing is complete) */}
            {!processingState.isProcessing && processingState.progress === 100 && (
              <Suspense fallback={<p>Loading results...</p>}>
                <div className="mt-8 pt-8 border-t border-gray-200" aria-live="polite">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Generated Code</h4>
                  <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-4 md:space-y-0">
                    <button
                      type="button"
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      aria-label="Előnézet megtekintése"
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      aria-label="Kód megtekintése"
                    >
                      <Code2 className="w-4 h-4" aria-hidden="true" />
                      <span>View Code</span>
                    </button>

                    <button
                      type="button"
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                      aria-label="Letöltés"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}