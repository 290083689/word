import { Upload, ScanText, Pencil, Download } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: '上传图片',
    desc: '拖拽或点击上传包含表格的图片',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: ScanText,
    title: '智能识别',
    desc: 'OCR自动识别表格内容与结构',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Pencil,
    title: '编辑修正',
    desc: '双击单元格编辑修正识别结果',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: Download,
    title: '导出下载',
    desc: '一键生成Excel文件并下载',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
]

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">
          表格图片转 Excel
        </h2>
        <p className="text-zinc-400 text-base">
          上传表格图片，智能识别内容，一键导出 Excel 文件
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl w-full">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`
              relative flex flex-col items-center text-center p-6
              rounded-2xl border ${step.border} ${step.bg}
              transition-all duration-300 hover:scale-105 hover:shadow-md
            `}
          >
            <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500 shadow-sm">
              {idx + 1}
            </div>
            <step.icon className={`w-8 h-8 ${step.color} mb-3`} />
            <h3 className="font-semibold text-zinc-700 mb-1">{step.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
