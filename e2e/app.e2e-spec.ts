import { AngularfireDicePage } from './app.po';

describe('angularfire-dice App', function() {
  let page: AngularfireDicePage;

  beforeEach(() => {
    page = new AngularfireDicePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
