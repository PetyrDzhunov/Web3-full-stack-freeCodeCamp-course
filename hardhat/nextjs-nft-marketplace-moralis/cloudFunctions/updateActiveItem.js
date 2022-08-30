/*Cloud function that is going to create a new entry in a new
table called ActiveItem anytime ItemListed event happens so after
ItemListed is called it is the trigger to call this cloud function
*/

Moralis.Cloud.afterSave('ItemListed', async (request) => {
  const confirmed = request.object.get('confirmed');
  const logger = Moralis.Cloud.getLogger();
  logger.info('Looking for confirmed Tx');

  if (confirmed) {
    logger.info('Found Item!');
    const ACTIVE_ITEM = Moralis.Object.extend('ActiveItem'); // if this table exists grab it if not create it

    const activeItem = new ACTIVE_ITEM(); // create new Entry in table
    activeItem.set('marketplaceAddress', request.object.get('address'));
    activeItem.set('nftAddress', request.object.get('nftAddress'));
    activeItem.set('price', request.object.get('price'));
    activeItem.set('tokenId', request.object.get('tokenId'));
    activeItem.set('seller', request.object.get('seller'));
    logger.info(
      `Adding Address: ${request.object.get(
        'address',
      )}. TokenId : ${request.object.get('tokenId')}`,
    );
    logger.info('Saving...');
    await activeItem.save();
  }
});
