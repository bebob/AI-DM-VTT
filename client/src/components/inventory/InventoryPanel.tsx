import { usePartyStore } from '../../stores/partyStore';
import type { Item } from '@ai-dm-vtt/shared';
import { RetroPanel } from '../layout/RetroPanel';
import './InventoryPanel.css';

const TYPE_ICONS: Record<Item['type'], string> = {
  weapon: '[W]',
  armor: '[A]',
  potion: '[P]',
  scroll: '[S]',
  gear: '[G]',
  treasure: '[$]',
  ammo: '[>]',
  custom: '[?]',
};

export function InventoryPanel() {
  const characters = usePartyStore((s) => s.characters);
  const activeId = usePartyStore((s) => s.activeCharacterId);
  const inventory = usePartyStore((s) => s.inventory);
  const currency = usePartyStore((s) => s.currency);

  const charId = activeId || characters[0]?.id;
  const charInv = inventory.find((i) => i.characterId === charId);
  const charCurrency = charId ? currency.characters[charId] : undefined;

  return (
    <RetroPanel title="Inventory" className="inventory-panel">
      {/* Currency */}
      <div className="inv__currency">
        <span className="inv__coin inv__coin--gp">{charCurrency?.gp ?? 0} GP</span>
        <span className="inv__coin inv__coin--sp">{charCurrency?.sp ?? 0} SP</span>
        <span className="inv__coin inv__coin--cp">{charCurrency?.cp ?? 0} CP</span>
      </div>

      <hr className="retro-divider" />

      {/* Items */}
      {(!charInv || charInv.items.length === 0) ? (
        <div className="inv__empty">No items yet.</div>
      ) : (
        <div className="inv__grid">
          {charInv.items.map((item) => (
            <div
              key={item.id}
              className={`inv__item ${item.equipped ? 'inv__item--equipped' : ''} ${item.attuned ? 'inv__item--attuned' : ''}`}
              title={item.description}
            >
              <span className="inv__item-icon">{TYPE_ICONS[item.type]}</span>
              <div className="inv__item-info">
                <span className="inv__item-name">
                  {item.name}
                  {item.quantity > 1 && <span className="inv__item-qty"> x{item.quantity}</span>}
                </span>
                {item.charges && (
                  <span className="inv__item-charges">
                    {item.charges.current}/{item.charges.max}
                  </span>
                )}
              </div>
              <div className="inv__item-badges">
                {item.equipped && <span className="inv__badge inv__badge--equipped">E</span>}
                {item.attuned && <span className="inv__badge inv__badge--attuned">A</span>}
                {item.homebrew && <span className="inv__badge inv__badge--homebrew">H</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </RetroPanel>
  );
}
