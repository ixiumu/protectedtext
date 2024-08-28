import ProtectedText from './index'

(async () => {
    const protectedText = new ProtectedText('test-okok', 'test')

    console.log('get/create', await protectedText.get()) // create
    console.log('set', await protectedText.set(['note1', 'note2']))

    console.log('getSite', await protectedText.getSite()) // get new site status
    console.log('removeSite', await protectedText.removeSite())
})();
