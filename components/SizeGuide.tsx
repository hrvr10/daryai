import { topsSizeGuide, bottomsSizeGuide } from "@/lib/sizeGuide";

export default function SizeGuide() {
  return (
    <div>
      <p className="mb-4 text-xs text-neutral-400">
        All measurements in cm, body measurements (not garment).
      </p>

      <div className="mb-5">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Tops &amp; dresses
        </h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="py-1.5">Size</th>
              <th className="py-1.5">Bust</th>
              <th className="py-1.5">Waist</th>
              <th className="py-1.5">Hip</th>
            </tr>
          </thead>
          <tbody>
            {topsSizeGuide.map((row) => (
              <tr key={row.size} className="border-b border-neutral-100">
                <td className="py-1.5 font-medium text-black">{row.size}</td>
                <td className="py-1.5">{row.bust}</td>
                <td className="py-1.5">{row.waist}</td>
                <td className="py-1.5">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Bottoms
        </h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="py-1.5">Size</th>
              <th className="py-1.5">Waist</th>
              <th className="py-1.5">Hip</th>
            </tr>
          </thead>
          <tbody>
            {bottomsSizeGuide.map((row) => (
              <tr key={row.size} className="border-b border-neutral-100">
                <td className="py-1.5 font-medium text-black">{row.size}</td>
                <td className="py-1.5">{row.waist}</td>
                <td className="py-1.5">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
