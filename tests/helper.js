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
    await login(page, 'testikäyttäjä2', 'salasana2')
    await createBlog(page, 'Some Blog01')
    await createBlog(page, 'Some Blog02')
    await page.getByTestId('logout').click()
    await login(page, 'testikäyttäjä', 'salasana')
    await createBlog(page, 'Some Blog03')
    await page.getByTestId('logout').click()

}

const login = async (page, user, password) => {
    await page.getByTestId('username').fill(user)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title) => {
    // await page.pause()
    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill('Author of this blog')
    await page.getByTestId('url').fill('Url of blog')
    await page.getByTestId('createbutton').click()
    await page.getByTestId('canceltoggle').click()

}

// const like = async (nth, page) => {
//     await page.locator('.blog > button').nth(nth).click();
//     await page.getByRole('button', { name: 'like' }).click();
// }

const likeBlogByName = async (page, blogName) => {
    await findBlogByName(page, blogName).locator('button').click()
    await page.getByRole('button', { name: 'like' }).click();
    await page.getByTestId('hideBlog').click()
}
/* removeBlogByName vaatii rivin: 
    page.on('dialog', dialog => dialog.accept());
mutta se pitää olla siellä missä tätä kutsutaan,
koska vain niin tätä voi kutsua useamman kerran.
Jos se on täällä sisällä,
se valittaa että ei voi hyväksyä dialogia joka on jo hyväksytty. */
const removeBlogByName = async (page, blogName) => {
    await findBlogByName(page, blogName).locator('button').click()
    await page.getByTestId('deleteBlog').click()
}

const findBlogByName = (page, blogName) => {
    return page.locator('div.blog').locator(`:text("${blogName}")`).locator('..')
    // ylläoleva sijainti suomeksi: div.blog >> : text("${blogName}") >> ..

}

module.exports = { reset, login, resetWithBlogs, createBlog, likeBlogByName, removeBlogByName };