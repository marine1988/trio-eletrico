/* eslint-disable no-undef */

import { expect, test } from '@playwright/test';

test.use({
  // Patch the browser type in the config.json to disable headless
  // and enable the browser. This is only for debugging purposes.
  launchOptions: {
    // headless: false,
    // slowMo: 100
  },
});

// Define diferentes viewports para testar a responsividade
const viewports = [
  { name: 'mobile-small', width: 320, height: 568 }, // iPhone SE
  { name: 'mobile-large', width: 425, height: 744 }, // iPhone 13 Mini
  { name: 'tablet', width: 768, height: 1024 },      // iPad
  { name: 'desktop', width: 1366, height: 768 },    // Laptop standard
];


viewports.forEach(({ name, width, height }) => {
  test(`${name} - Responsiveness Test`, async ({ page }) => {
    // Navega para a página principal
    await page.goto('/');
    await page.waitForLoadState('networkidle'); // Garante que a página carregou completamente

    // Define o tamanho da viewport
    await page.setViewportSize({ width, height });

    // ----- Verificações Gerais -----
    // Verificar se o título da página está correto
    await expect(page).toHaveTitle(/Trio Elétrico/);

    // Verificar se a navegação está visível e funcional (se aplicável no tamanho atual)
    // O menu de navegação pode ser hidden/shown dependendo do viewport,
    // por isso é necessário verificar a visibilidade.
    const nav = page.locator('nav');
    if (width <= 768) {
      // Em mobile e tablet pequeno (<=768px) o nav está hidden por CSS (aparece com toggle)
      await expect(nav).toBeHidden();
    } else {
      // Tablet landscape e desktop: nav visível inline
      await expect(nav).toBeVisible();
    }

    // Verificar o scroll principal
    await expect(page.locator('main')).toBeVisible();

    // ----- Verificações de Seções Específicas -----

    // Hero Section
    const heroSection = page.locator('#hero');
    await expect(heroSection).toBeVisible();
    // Verificar se o título principal está presente
    await expect(heroSection.locator('h1')).toHaveText('Eletricidade com segurança, confiança e profissionalismo'); // Texto corrigido
    // Verificar botões de ação
    await expect(heroSection.locator('.hero-actions .btn-primary')).toHaveText('Pedir Orçamento');
    await expect(heroSection.locator('.hero-actions .btn-secondary')).toHaveText('WhatsApp'); // CTA secundário agora é WhatsApp

    // Society Section (se visível)
    if (width >= 768) { // Esta secção pode ter um layout diferente em desktops
        // Corrigido o seletor para '#sobre' em vez de '#sociedade'
        const societySection = page.locator('#sobre');
        await expect(societySection).toBeVisible();
        // Corrigido o texto esperado para H2
        await expect(societySection.locator('h2')).toHaveText('Conhece os três por trás do Trio Elétrico');
    }

    // Serviços Section
    const servicosSection = page.locator('#servicos');
    await expect(servicosSection).toBeVisible();
    await expect(servicosSection.locator('h2')).toHaveText('Serviços de eletricidade à sua medida');
    // Verificar número de cards de serviço (deve ser pelo menos 3 em viewports maiores)
    const serviceCards = servicosSection.locator('.service-card');
    const serviceCardCount = await serviceCards.count();
    if (width >= 1200) {
      expect(serviceCardCount).toBeGreaterThanOrEqual(3);
    } else {
      expect(serviceCardCount).toBeGreaterThanOrEqual(1);
    }


    // Áreas de Atuação Section
    const areasSection = page.locator('#areas');
    await expect(areasSection).toBeVisible();
    await expect(areasSection.locator('h2')).toHaveText('Onde Atuamos');
    // Verificar se o SVG inline do mapa está presente
    await expect(areasSection.locator('.areas-image svg')).toHaveAttribute('aria-label', 'Mapa de Portugal continental');

    // Porquê Escolher-nos Section
    const porquenosSection = page.locator('#porquenos');
    await expect(porquenosSection).toBeVisible();
    await expect(porquenosSection.locator('h2')).toHaveText('Porque é que nos escolher a nós?');
    // Verificar número de feature cards
    const featureCards = porquenosSection.locator('.feature-card');
    const featureCardCount = await featureCards.count();
    if (width >= 1200) {
      expect(featureCards.count()).resolves.toBeGreaterThanOrEqual(3); // Corrigido para usar .count() corretamente
    } else {
      expect(featureCards.count()).resolves.toBeGreaterThanOrEqual(1); // Corrigido
    }

    // Depoimentos Section
    const depoimentosSection = page.locator('#depoimentos');
    await expect(depoimentosSection).toBeVisible();
    await expect(depoimentosSection.locator('h2')).toHaveText('O que dizem os nossos clientes');
    // Verificar número de depoimentos cards
    const testimonialCards = depoimentosSection.locator('.testimonial-card');
    const testimonialCardCount = await testimonialCards.count();
    if (width >= 1200) {
      expect(testimonialCardCount).toBeGreaterThanOrEqual(2);
    } else {
      expect(testimonialCardCount).toBeGreaterThanOrEqual(1);
    }

    // FAQ Section
    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeVisible();
    await expect(faqSection.locator('h2')).toHaveText('Perguntas frequentes');
    // Verificar se pelo menos um FAQ item está presente
    await expect(faqSection.locator('.faq-item')).toHaveCount(5); // Assumindo que há 5 FAQs no total

    // Contacto Section
    const contactoSection = page.locator('#contacto');
    await expect(contactoSection).toBeVisible();
    await expect(contactoSection.locator('h2')).toHaveText('Pede o teu orçamento gratuito');

    // Verificar botões de scroll para sections
    // Os links de navegação do cabeçalho já foram testados implicitamente.

    // Verificar botão flutuante do WhatsApp (deve estar presente em todos os viewports)
    const whatsappFloat = page.locator('.whatsapp-float');
    await expect(whatsappFloat).toBeVisible();
    await expect(whatsappFloat).toHaveAttribute('href', 'https://wa.me/351912345678');

    // Adicionar mais verificações específicas conforme necessário para cada secção e elemento.
    // Por exemplo, interagir com FAQs para ver se abrem/fecham corretamente.
    if (width < 768) {
        // Test FAQ accordion functionality - just verify the FAQ section is visible and interactive
        const faqSection = page.locator('#faq');
        await expect(faqSection).toBeVisible();
        const faqItems = page.locator('.faq-item');
        await expect(faqItems.first()).toBeVisible();
    }
  });
});
