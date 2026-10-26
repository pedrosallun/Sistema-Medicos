import {test,expect} from '@playwright/test';
test.use({baseURL:'http://127.0.0.1:3223'});
test('demo aceita teste123 no navegador e exibe os exemplos',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('Demonstração · dados fictícios')).toBeVisible();
 await page.getByLabel('E-mail profissional').fill('teste@gmail.com');
 await page.getByLabel('Senha',{exact:true}).fill('teste123');
 await page.getByRole('button',{name:'Entrar no painel'}).click();
 await expect(page.getByRole('heading',{name:'Cada paciente, uma história.'})).toBeVisible();
 await expect(page.getByText('Mariana Oliveira',{exact:true}).first()).toBeVisible();
 await expect(page.locator('.badge').filter({hasText:'Misto'}).first()).toBeVisible();
 await page.getByRole('button',{name:'Ver →'}).first().click();
 await expect(page.getByRole('heading',{name:'Resumo pré-consulta'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Gerar rascunho com Claude'})).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
