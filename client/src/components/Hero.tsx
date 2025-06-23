
import React, { memo } from "react";
import { ArrowRight, Zap, Target, Sparkles } from "lucide-react";

// Ikonok memoizálva a felesleges újrarenderelés elkerülésére
const MemoArrowRight = memo(ArrowRight);
const MemoZap = memo(Zap);
const MemoTarget = memo(Target);
const MemoSparkles = memo(Sparkles);

// Újrafelhasználható Button komponens
function Button({ children, onClick, variant = "primary", ariaLabel }) {
  const baseClasses =
    "px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500";
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/25",
    secondary:
      "border-2 border-gray-200 text-gray-700 hover:bg-white hover:shadow-xl",
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

// Újrafelhasználható Card komponens
function InfoCard({ icon: Icon, iconBg, title, subtitle }) {
  return (
    <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
      <div className={`${iconBg} p-3 rounded-full`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-left">
        <div className="text-2xl font-bold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
    </div>
  );
}

export function Hero() {
  // Például onClick események
  const handleStartClick = () => {
    // Itt lehet pl. navigáció vagy modal nyitás
    alert("Start Converting clicked!");
  };

  const handleDemoClick = () => {
    alert("View Demo clicked!");
  };

  return (
    <section className="relative py-20 px-6 overflow-hidden" aria-label="Hero section">
      {/* Background Elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto">
          <div
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-8"
            aria-label="Highlight"
          >
            <MemoSparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              AI-Powered Design-to-Code Revolution
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            From{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Figma
            </span>
            <br />
            to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Production Code
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Generate pixel-perfect React, HTML, and Vue components from Figma designs with{" "}
            <strong className="text-gray-900">95-100% visual accuracy</strong> in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Button
              variant="primary"
              onClick={handleStartClick}
              ariaLabel="Start converting Figma designs to code"
            >
              <span>Start Converting</span>
              <MemoArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>

            <Button variant="secondary" onClick={handleDemoClick} ariaLabel="View demo of the product">
              View Demo
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            role="list"
            aria-label="Key product features"
          >
            <InfoCard
              icon={MemoTarget}
              iconBg="bg-green-100"
              title="95-100%"
              subtitle="Visual Accuracy"
            />
            <InfoCard
              icon={MemoZap}
              iconBg="bg-blue-100"
              title="&lt;30s"
              subtitle="Generation Time"
            />
            <InfoCard
              icon={MemoSparkles}
              iconBg="bg-purple-100"
              title="WCAG 2.1"
              subtitle="AA Compliant"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
