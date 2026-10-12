from playwright.sync_api import sync_playwright
import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:8769')
parser.add_argument('--artifacts', type=Path, default=Path('/tmp/collection-objects-review'))
args = parser.parse_args()
args.artifacts.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for width in [320,390,768,1440]:
  page=b.new_page(viewport={'width':width,'height':950});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(args.base_url+'/library/design-study/')
  page.locator('.rotating-library .object-stage').last.wait_for()
  assert page.locator('.rotating-library .collection-object').count()==2
  for i,front,back in [(0,'Read','Reading'),(1,'All','Wishlist')]:
   obj=page.locator('.rotating-library .collection-object').nth(i)
   assert obj.get_attribute('data-facing')==front
   obj.locator('.object-stage').focus();page.keyboard.press('Enter')
   assert page.locator('.study-category').inner_text()==front
   obj.locator('.object-button').click();page.wait_for_timeout(650)
   assert obj.get_attribute('data-facing')==back
   obj.locator('.object-stage').focus();page.keyboard.press('Enter')
   assert page.locator('.study-category').inner_text()==back
   obj.locator('.object-button').click();page.wait_for_timeout(650)
  assert page.locator('.cover-title-zone').nth(1).inner_text()=='Quantum'
  assert page.locator('.study-orientations .spine-author').count()==0
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('.study-preview').evaluate('(e)=>e.hidden=true')
  page.screenshot(path=str(args.artifacts/f'library-rotating-{width}.png'),full_page=True)
  page.goto(args.base_url+'/favorite-papers/')
  page.locator('.paper-file-boxes .collection-object').last.wait_for()
  assert page.locator('.paper-file-boxes .collection-object').count()==3
  assert page.locator('.paper-file-boxes .file-target').count()==26
  for i in range(26):
   target=page.locator('.paper-file-boxes .file-target').nth(i)
   target.focus();target.press('Enter')
   assert target.locator('xpath=ancestor::section[1]').locator('.paper-file-readout h4').inner_text()==target.get_attribute('aria-label').split(': ',1)[1]
  page.screenshot(path=str(args.artifacts/f'papers-files-{width}.png'),full_page=True)
  page.get_by_role('button',name='By journal',exact=True).click()
  assert page.locator('.paper-file-boxes .file-target').count()==26
  assert page.locator('.paper-file-boxes .collection-object').count()>3
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  print('PASS',width,'shelf rotation, keyboard, cover simplification, 26 files, journal grouping and overflow')
  page.close()
 page=b.new_page(java_script_enabled=False);page.goto(args.base_url+'/favorite-papers/');assert page.locator('.favorite-paper').count()==26;assert page.locator('.favorite-paper').first.is_visible()
 page=b.new_page(reduced_motion='reduce');page.goto(args.base_url+'/library/design-study/');page.locator('.object-button').first.click();assert page.locator('.collection-object').first.get_attribute('data-facing')=='Reading'
 print('PASS JavaScript-disabled list and reduced motion')
 b.close()
