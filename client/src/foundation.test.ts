import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('index.html foundation', () => {
  const htmlPath = path.resolve(__dirname, '../index.html');
  
  it('has the correct title', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    expect(htmlContent).toContain('<title>Pastoral do Batismo</title>');
  });

  it('has the viewport meta tag for mobile responsiveness', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    expect(htmlContent).toContain('name="viewport"');
    expect(htmlContent).toContain('content="width=device-width, initial-scale=1.0"');
  });

  it('has the referrer policy meta tag for security', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    expect(htmlContent).toContain('name="referrer"');
    expect(htmlContent).toContain('content="no-referrer"');
  });

  it('has the correct lang attribute', () => {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    expect(htmlContent).toContain('lang="pt-BR"');
  });
});
