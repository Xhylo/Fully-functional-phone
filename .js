/**
 * Based on http://dribbble.com/shots/796696-Coral-Reference-Guide-iPhone-App-Submenu
 */


/*
 * RequestAnimationFrame polyfill by Erik Möller
 */
(function(){var b=0;var c=["ms","moz","webkit","o"];for(var a=0;a<c.length&&!window.requestAnimationFrame;++a){window.requestAnimationFrame=window[c[a]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[c[a]+"CancelAnimationFrame"]||window[c[a]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame){window.requestAnimationFrame=function(h,e){var d=new Date().getTime();var f=Math.max(0,16-(d-b));var g=window.setTimeout(function(){h(d+f)},f);b=d+f;return g}}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(d){clearTimeout(d)}}}());

$(function() {
  // duplicate headers so we can fold them
  $('.foldmenu-header').each(function() {
    var $this       = $(this),
        perspective = $('<div class="foldmenu-perspective"></div>'),
        foldTop     = $('<div class="foldmenu-fold__top"></div>'),
        foldBottom  = $('<div class="foldmenu-fold__bottom"></div>');
    $this.replaceWith(perspective);
    
    perspective.append(foldTop);
    perspective.append(foldBottom);
    
    foldTop.append($this);
    foldBottom.append($this.clone());
  });
  
  var items = $('.foldmenu-item'),
      status = {
        action: 'none', // action in ['none', 'expand', 'collapse']
        current: null, // current in [null, 0, 1, 2, 3] - index of currently expanded item
        next: null, // next in [null, 0, 1, 2, 3] - index of next item to expand
        time: 0 // 0 <= time <= 1
      },
      el = {
        sub: null, // currently expanding/collapsing submenu 
        top: null, // currently folding elements
        bottom: null // currently folding elements
      };
  
  var $app = $('.app'),
      foldmenuOpen = false;
  
  // click events
  $('.open-foldmenu').on('click', function() {
    (foldmenuOpen = !foldmenuOpen) ? $app.css({left: 112}) : $app.css({left: 0});
  });
  
  $('.foldmenu').on('click', '.foldmenu-perspective', function() {
    if (status.action !== 'none')
      return;
    
    var item = $(this).parents('.foldmenu-item'),
        index = items.index(item);
    
    // set animation status
    if (status.current === null) {
      status.action = 'expand'; // nothing to collapse
      el.sub = $('.foldmenu-sub:eq(' + index + ')');
      el.top = $('.foldmenu-fold__top:not(:eq(' + index + '))');
      el.bottom = $('.foldmenu-fold__bottom:not(:eq(' + index + '))');
    } else {
      items.eq(status.current).removeClass('active');
      
      status.action = 'collapse'; // collapse current first
      el.sub = $('.foldmenu-sub:eq(' + status.current + ')');
      el.top = $('.foldmenu-fold__top:not(:eq(' + status.current + '))');
      el.bottom = $('.foldmenu-fold__bottom:not(:eq(' + status.current + '))');
    }
    if (status.current !== index)
      status.next = index; // expand next (after collapsing current, if any)
    // start animation
    status.time = 0;
    requestAnimationFrame(animate);
  });
  
  // animation loop
  function animate() {
    // increase timer
    status.time += 0.07;
    if (status.time > 1) {
      status.time = 1;
    } else {
      requestAnimationFrame(animate);
    }
    
    // ToDo: DRY!
    
    if (status.action === 'expand') {
      var margin = fold(60 * status.time);
      el.sub.css('height', 3 * margin + 'px');
      
      if (status.time == 1) {
        status.action = 'none';
        status.current = status.next;
        status.next = null;
        status.time = 0;
        
        items.eq(status.current).addClass('active');
      }
    } else if (status.action === 'collapse') {
      var margin = fold(60 * (1 - status.time));
      el.sub.css('height', 3 * margin + 'px');
      
      if (status.time == 1) {
        if (status.next !== null) {
          el.sub = $('.foldmenu-sub:eq(' + status.next + ')');
          el.top = $('.foldmenu-fold__top:not(:eq(' + status.next + '))');
          el.bottom = $('.foldmenu-fold__bottom:not(:eq(' + status.next + '))');
          
          status.action = 'expand';
          
          requestAnimationFrame(animate);
        } else {
          status.action = 'none';
        }
        
        status.current = null;
        status.time = 0;
      }
    }
  }
  
  function fold(deg) {
    var gap = Math.ceil((1 - Math.cos(deg * Math.PI / 180)) * 112);
    
    el.top.css({
      marginBottom: -gap + 'px',
      transform: 'rotateX(' + -deg + 'deg)',
      opacity: 1 - 0.0017 * deg
    });
    el.bottom.css({
      transform: 'rotateX(' + deg + 'deg)'
    });
    
    return gap;
  }
  
  // trigger initial click
  setTimeout(function() {
    $('.open-foldmenu').click();
  }, 500);
  setTimeout(function() {
    $('.foldmenu-perspective:eq(0)').click();
  }, 1000);
  
  // update time
  $time = $('.phone-time');
  function updateTime() {
    var current = new Date();
    $time.text(current.toTimeString().slice(0, 5));
    setTimeout(updateTime, (60 - current.getSeconds()) * 1000);
  }
  updateTime();
});
