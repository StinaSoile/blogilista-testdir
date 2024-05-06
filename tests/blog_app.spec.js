const { test, describe, expect, beforeEach } = require('@playwright/test')
const exp = require('constants')
// const { request } = require('http')
// const { before } = require('node:test')
const { reset, login, resetWithBlogs, createBlog, like } = require('./helper')
// const { before, beforeEach, afterEach } = require('node:test')

describe('Blog app', () => {
    beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173')
    })

    test('login form in front page', async ({ page }) => {

        await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
        const username = page.locator('input[name="Username"]')
        await expect(username).toBeVisible()
        const password = page.locator('input[name="Password"]')
        await expect(password).toBeVisible()
    })
})

describe('Login', () => {

    beforeEach(async ({ page, request }) => {
        await reset(request)
        await page.goto('http://localhost:5173')
    })

    test('login as valid user', async ({ page }) => {
        await login(page)
        await expect(page.getByText(/Logged in as testikäyttäjä/)).toBeVisible()
        await expect(page.getByText(/Welcome, testikäyttäjä/)).toBeVisible()

    })

    test('no login as invalid user', async ({ page }) => {
        await page.getByTestId('username').fill('testikäyttäjä')
        await page.getByTestId('password').fill('epäsalasana')
        await page.getByRole('button', { name: 'login' }).click()
        await expect(page.getByText(/Logged in as testikäyttäjä/)).not.toBeVisible()
        await expect(page.getByText(/Wrong credentials/)).toBeVisible()
    })
})

describe('when logged in', () => {
    beforeEach(async ({ page, request }) => {
        await reset(request)
        await page.goto('http://localhost:5173')

        await login(page)
    })

    test('can create blog', async ({ page }) => {
        await createBlog('Title of blog', page)
        await expect(page.getByText(/New blog Title of blog created/)).toBeVisible()
        await expect(page.getByText('Title of blog Author of blog')).toBeVisible()
    })

    test('can sign out', async ({ page }) => {
        await page.getByTestId('logout').click()
        await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
        const username = page.locator('input[name="Username"]')
        await expect(username).toBeVisible()
        const password = page.locator('input[name="Password"]')
        await expect(password).toBeVisible()
    })

})

describe('logged in, many blogs', async () => {
    beforeEach(async ({ page, request }) => {
        await resetWithBlogs({ page, request })
        await page.goto('http://localhost:5173')

        await login(page)
    })

    test('can like blog', async ({ page }) => {
        await like(0, page)
        await expect(page.getByRole('cell', { name: '1 like' })).toBeVisible()
    })

    test('can remove own blog', async ({ page }) => {
        await createBlog('removable', page)

        await expect(page.getByText(/removable Author of blog/)).toBeVisible()
        await page.getByRole('button', { name: 'view' }).nth(2).click()
        page.on('dialog', dialog => dialog.accept());
        await page.getByTestId('deleteBlog').click()
        await expect(page.getByText(/removable Author of blog/)).not.toBeVisible()
    })

    test('cant see deletebutton of others blogs', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).first().click()
        await expect(page.getByTestId('hideBlog')).toBeVisible()
        await expect(page.getByTestId('deleteBlog')).not.toBeVisible()
    })

    test.only('blogs arranged by likes', async ({ page }) => {
        await createBlog('Blog03', page)
        await like(1, page)
        await page.getByTestId('hideBlog').click()
        await like(1, page)
        await page.getByTestId('hideBlog').click()
        await like(2, page)
        await page.getByTestId('hideBlog').click()

        await expect(page.locator('div.blog').first()).toHaveText(/Blog02 Author of blog/)
        await expect(page.locator('div.blog').nth(1)).toHaveText(/Blog03 Author of blog/)
        await expect(page.locator('div.blog').nth(2)).toHaveText(/Blog01 Author of blog/)

    })
})



/* 5.17:
Tee testi, joka varmistaa, että sovellus näyttää oletusarvoisesti kirjautumislomakkeen.
DONE: login form in front page

5.18:
Tee testit kirjautumiselle. 
Testaa sekä onnistunut että epäonnistunut kirjautuminen. 
Luo testejä varten käyttäjä beforeEach-lohkossa. 
DONE: describe login

5.19:

Tee testi, joka varmistaa, että kirjautunut käyttäjä pystyy luomaan blogin.
DONE

5.20:
Tee testi, joka varmistaa, että blogia voi likettää.
DONE

5.21:
Tee testi, joka varmistaa, että blogin lisännyt käyttäjä voi poistaa blogin. 
Jos käytät poisto-operaation yhteydessä window.confirm-dialogia, 
saatat joutua hieman etsimään 
miten dialogin käyttö tapahtuu Playwright-testeistä käsin.
DONE

5.22:
Tee testi, joka varmistaa, että 
vain blogin lisännyt käyttäjä näkee blogin poistonapin.
DONE

5.23:
Tee testi, joka varmistaa, että blogit järjestetään
likejen mukaiseen järjestykseen, eniten likejä saanut blogi ensin.

Tämä tehtävä on edellisiä huomattavasti haastavampi.
DONE
*/