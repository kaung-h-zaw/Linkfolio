import { ColorControl } from './editor/AppearanceControls'
const surfaces = { '#137763':'#f1f6f2', '#245778':'#f0f5f8', '#394653':'#f3f4f5', '#91472f':'#faf3ed', '#843b4d':'#faf1f3', '#59632d':'#f5f6ee' }
export default function ColorPalettePicker({ color, onSelect, label = 'Color palette' }) {
  return <ColorControl label={label} value={color} hint={!color ? 'Template default' : undefined} namesOnly onChange={(accent) => onSelect({ accent, surface: surfaces[accent] || '#f4f6f8' })} />
}
