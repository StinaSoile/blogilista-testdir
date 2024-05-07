const { test, describe, expect, beforeEach } = require('@playwright/test')
const exp = require('constants')
// const { request } = require('http')
// const { before } = require('node:test')
const { reset, login, resetWithBlogs, createBlog, likeBlogByName, removeBlogByName } = require('./helper')
const { setTimeout } = require('timers')
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
        await login(page, 'testikäyttäjä', 'salasana')
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

        await login(page, 'testikäyttäjä', 'salasana')
    })

    test('can create blog', async ({ page }) => {
        await createBlog(page, 'Title of blog')
        await expect(page.getByText(/New blog Title of blog created/)).toBeVisible()
        await expect(page.getByText('Title of blog Author of this blog')).toBeVisible()
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

        await login(page, 'testikäyttäjä', 'salasana')
    })

    test('can like blog', async ({ page }) => {
        await page.locator('.blog > button').first().click();
        await page.getByRole('button', { name: 'like' }).click();

        await expect(page.getByRole('cell', { name: '1 like' })).toBeVisible()
    })

    test('can remove own blog', async ({ page }) => {
        await createBlog(page, 'removable')
        page.on('dialog', dialog => dialog.accept());

        await expect(page.getByText(/removable Author of this blog/)).toBeVisible()
        await expect(page.getByText(/Some Blog03 Author of this blog/)).toBeVisible()

        await removeBlogByName(page, 'removable')
        await expect(page.getByText(/removable Author of this blog/)).not.toBeVisible()

        await page.waitForTimeout(300)

        await removeBlogByName(page, 'Some Blog03')
        await expect(page.getByText(/Some Blog03 Author of this blog/)).not.toBeVisible()

    })

    test('cant see deletebutton of others blogs', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).first().click()
        await expect(page.getByTestId('hideBlog')).toBeVisible()
        await expect(page.getByTestId('deleteBlog')).not.toBeVisible()
    })

    test('blogs arranged by likes', async ({ page }) => {

        await likeBlogByName(page, 'Some Blog03')
        await likeBlogByName(page, 'Some Blog02')
        await likeBlogByName(page, 'Some Blog02')
        const blogsLocators = page.locator('div.blog >> div')
        const texts = await blogsLocators.allTextContents()
        const expectedOrder = [
            'Some Blog02 Author of this blog',
            'Some Blog03 Author of this blog',
            'Some Blog01 Author of this blog'
        ]
        expect(texts).toStrictEqual(expectedOrder)
    })
})