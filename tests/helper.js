const reset = async (request) => {
    await request.post('http:localhost:3001/api/testing/reset')

    await request.post('http://localhost:3001/api/users', {
        data: {
            username: 'testikäyttäjä',
            name: 'Käyttäjä',
            password: 'salasana'
        }
    })
    await request.post('http://localhost:3001/api/users', {
        data: {
            username: 'testikäyttäjä2',
            name: 'Käyttäjä2',
            password: 'salasana2'
        }
    })
}

const resetWithBlogs = async ({ page, request }) => {

    await reset(request)

    await page.goto('http://localhost:5173')
    // await page.pause()
    await login2(page)
    await createBlog('Blog01', page)
    await createBlog('Blog02', page)
    await page.getByTestId('logout').click()

}
/*
TAVOITE: 
Luo kaksi käyttäjää, ota talteen ne kun reqponse palauttaa ne.
Luo < 5 blogia joilla kaksi eri käyttäjää usereina.
Tee tästä resetWithBlogs
*/

const login = async (page) => {
    await page.getByTestId('username').fill('testikäyttäjä')
    await page.getByTestId('password').fill('salasana')
    await page.getByRole('button', { name: 'login' }).click()
}
const login2 = async (page) => {
    await page.getByTestId('username').fill('testikäyttäjä2')
    await page.getByTestId('password').fill('salasana2')
    await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (title, page) => {
    // await page.pause()
    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill('Author of blog')
    await page.getByTestId('url').fill('Url of blog')
    await page.getByTestId('createbutton').click()
    await page.getByTestId('canceltoggle').click()

}

const like = async (nth, page) => {
    await page.locator('.blog > button').nth(nth).click();
    await page.getByRole('button', { name: 'like' }).click();
}

module.exports = { reset, login, resetWithBlogs, createBlog, like };