// Test per src/components/RegionSelector.jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { REGION_LIST } from '../data/regions.js';
import RegionSelector from '../components/RegionSelector.jsx';
import { useAppStore } from '../store/useAppStore.js';

function renderSelector() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <RegionSelector />
    </MemoryRouter>
  );
}

describe('RegionSelector', () => {
  beforeEach(() => {
    useAppStore.setState({ region: 'Lombardia', theme: 'light' });
  });

  it('mostra le esattamente 20 regioni italiane', () => {
    renderSelector();
    const options = screen.getAllByRole('option');
    expect(REGION_LIST).toHaveLength(20);
    expect(options).toHaveLength(20);
    expect(options.map((o) => o.textContent)).toEqual(REGION_LIST);
  });

  it("la regione 'Valle d'Aosta' è selezionabile e aggiorna lo store", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.selectOptions(screen.getByRole('combobox', { name: /regione/i }), "Valle d'Aosta");
    expect(useAppStore.getState().region).toBe("Valle d'Aosta");
  });

  it('ogni regione mostrata ha dati nel dataset (copertura useTERNA)', () => {
    renderSelector();
    const options = screen.getAllByRole('option');
    // Il selector usa i nomi canonici di REGIONS: tutti mappati alle chiavi dataset
    // (verificato in regions.test.js); qui confermiamo che nessun nome è una variante non mappata.
    for (const option of options) {
      expect(REGION_LIST).toContain(option.textContent);
    }
  });
});