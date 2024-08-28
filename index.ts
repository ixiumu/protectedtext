import CryptoJS from 'crypto-js'

export interface Site {
    eContent: string,
    isNew: boolean,
    currentDBVersion: number,
    expectedDBVersion: number,
}

export default class ProtectedText {
    site?: Site
    siteHash: string
    password: string
    api: string
    initHashContent: string = ''
    contents: string[] = []
    separator = CryptoJS.SHA512('-- tab separator --').toString()

    constructor(site: string, password: string) {
        if (!site.startsWith('/')) site = '/' + site
        this.siteHash = CryptoJS.SHA512(site).toString()
        this.password = password
        this.api = `https://www.protectedtext.com${site}`
    }

    async getSite(): Promise<Site | null> {
        try {
            const response = await fetch(`${this.api}?action=getJSON`)
            if (response.ok) {
                const site = await response.json() as Site
                if (site) {
                    let rawContent = CryptoJS.AES.decrypt(site.eContent, this.password)
                        .toString(CryptoJS.enc.Utf8)
                    if (rawContent.endsWith(this.siteHash)) {
                        rawContent = rawContent.slice(0, -this.siteHash.length)
                    }
                    this.site = site
                    this.initHashContent = this.hash(rawContent, site.currentDBVersion)
                    this.contents = rawContent.split(this.separator)
                    return this.site
                }
            }
        } catch (error) {
            console.error(error)
        }

        return null
    }

    async get(): Promise<string[]> {
        if (!this.site) await this.getSite()
        return this.contents
    }

    async set(content: string | string[]) {
        if (!this.site) await this.getSite()
        if (Array.isArray(content)) content = content.join(this.separator)

        const data = new URLSearchParams()
        data.append('initHashContent', this.initHashContent)
        data.append('currentHashContent', this.hash(content))
        data.append('encryptedContent', CryptoJS.AES.encrypt(String(content + this.siteHash), this.password).toString())
        data.append('action', 'save')

        return await fetch(this.api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            },
            body: data
        }).then(async response => {
            const data = await response.json() as { status?: string }
            return data.status === 'success'
        }).catch(error => console.error(error))
    }

    async removeSite(): Promise<boolean> {
        if (!this.site) await this.getSite()
        const data = new URLSearchParams()
        data.append('initHashContent', this.initHashContent)
        data.append('action', 'delete')
        try {
            const response = await fetch(this.api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: data
            });

            const responseData = await response.json() as { status?: string }
            return responseData.status === 'success'
        } catch (error) {
            console.error(error)
        }
        return false
    }

    hash(content: string, currentDBVersion?: number): string {
        const version = currentDBVersion || this.site?.currentDBVersion || 2
        if (version === 1) {
            return CryptoJS.SHA512(content).toString()
        } else if (version === 2) {
            return CryptoJS.SHA512(content + CryptoJS.SHA512(this.password).toString()).toString() + version
        } else {
            throw new Error('Error DBVersion')
        }
    }
}
