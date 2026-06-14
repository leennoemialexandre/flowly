"use client";

import { useState } from "react";
import { Automation, AutomationStep, EditableField } from "@/app/data/automations";

const STEP_COLORS = {
  trigger: { bg: "bg-emerald-50", text: "text-emerald-800", tag: "bg-emerald-50 text-emerald-700" },
  condition: { bg: "bg-amber-50", text: "text-amber-800", tag: "bg-amber-50 text-amber-700" },
  action: { bg: "bg-violet-50", text: "text-violet-800", tag: "bg-violet-50 text-violet-700" },
};

function EditPanel({ editable, onSave, onCancel }: { editable: EditableField; onSave: (val: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(editable.value);
  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs font-medium text-gray-500 mb-2">{editable.label}</p>
      {editable.options ? (
        <select className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-violet-400" value={val} onChange={(e) => setVal(e.target.value)}>
          {editable.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-violet-400" value={val} onChange={(e) => setVal(e.target.value)} />
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={() => onSave(val)} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-md hover:bg-violet-700">Save</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-gray-500 border border-gray-200 text-xs rounded-md hover:bg-gray-50">Cancel</button>
      </div>
    </div>
  );
}

function StepRow({ step, isLast, onUpdate }: { step: AutomationStep; isLast: boolean; onUpdate: (updated: AutomationStep) => void }) {
  const [editing, setEditing] = useState(false);
  const colors = STEP_COLORS[step.type];

  const handleSave = (val: string) => {
    if (!step.editable) return;
    onUpdate({ ...step, detail: `${step.detail.split(" (")[0]} (${step.editable.field}: ${val})`, editable: { ...step.editable, value: val } });
    setEditing(false);
  };

  return (
    <div className="flex gap-0">
      <div className="flex flex-col items-center w-10 flex-shrink-0 pt-2.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={`text-xs font-medium ${colors.text}`}>{step.type === "trigger" ? "T" : step.type === "condition" ? "?" : "→"}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 min-h-4" />}
      </div>
      <div className="flex-1 pb-4 pt-1.5 group">
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 ${colors.tag}`}>{step.type}</span>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-800">{step.label}</p>
          {step.editable && (
            <button onClick={() => setEditing(!editing)} className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-violet-600 transition-opacity px-1 py-0.5 rounded">edit</button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.detail}</p>
        {editing && step.editable && <EditPanel editable={step.editable} onSave={handleSave} onCancel={() => setEditing(false)} />}
      </div>
    </div>
  );
}

export default function RecipeCard({ automation }: { automation: Automation }) {
  const [steps, setSteps] = useState<AutomationStep[]>(automation.steps);
  const updateStep = (idx: number, updated: AutomationStep) => setSteps((prev) => prev.map((s, i) => (i === idx ? updated : s)));
  const addStep = () => setSteps((prev) => [...prev, { type: "action", icon: "sparkles", label: "New step", detail: "Hover to configure", editable: { field: "description", label: "What should this step do?", value: "" } }]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mt-2 max-w-md w-full">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
        <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
          <span className="text-violet-600 text-sm">⚡</span>
        </div>
        <span className="text-sm font-medium text-gray-800 flex-1">{automation.title}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Ready" />
      </div>
      <div className="px-4 pt-3 pb-1">
        {steps.map((step, i) => (
          <StepRow key={i} step={step} isLast={i === steps.length - 1} onUpdate={(updated) => updateStep(i, updated)} />
        ))}
      </div>
      <div className="px-4 pb-3">
        <button onClick={addStep} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50 transition-colors">
          + Add step
        </button>
      </div>
      <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
        <button className="flex-1 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 font-medium transition-colors">▶ Run now</button>
        <button className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">⏰ Schedule</button>
      </div>
    </div>
  );
}
