(function () {
  'use strict';

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  // Wrap value in YAML single-quotes if it contains characters that need quoting.
  function yamlScalar(val) {
    if (val === null || val === undefined || val === '') return 'null';
    var s = String(val);
    if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /^[\s"'0-9]/.test(s) || s !== s.trim()) {
      return "'" + s.replace(/'/g, "''") + "'";
    }
    return s;
  }

  function buildYaml(f) {
    var id = slugify(f.title) + '-' + f.date + '-' + f.start.replace(':', '');
    var lines = [
      '- id: ' + id,
      '  title: ' + yamlScalar(f.title),
      "  date: '" + f.date + "'",
      "  start: '" + f.start + "'",
      "  end: '" + f.end + "'",
      '  location: ' + yamlScalar(f.location),
      '  responsible: ' + yamlScalar(f.responsible),
    ];

    var desc = f.description.trim();
    if (desc) {
      lines.push('  description: |');
      desc.split('\n').forEach(function (l) { lines.push('    ' + l); });
    } else {
      lines.push('  description: null');
    }

    lines.push('  link: ' + (f.link ? yamlScalar(f.link) : 'null'));
    lines.push('  owner:');
    lines.push("    name: '" + (f.ownerName || '').replace(/'/g, "''") + "'");
    lines.push("    email: ''");
    lines.push('  meta:');
    lines.push('    created_at: null');
    lines.push('    updated_at: null');

    return lines.join('\n');
  }

  var form    = document.getElementById('event-form');
  var result  = document.getElementById('result');
  var output  = document.getElementById('yaml-output');
  var copyBtn = document.getElementById('copy-btn');
  var newBtn  = document.getElementById('new-btn');
  var errBox  = document.getElementById('form-errors');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var els         = form.elements;
    var title       = els.title.value.trim();
    var date        = els.date.value;
    var start       = els.start.value;
    var end         = els.end.value;
    var location    = els.location.value;
    var responsible = els.responsible.value.trim();

    var errs = [];
    if (!title)       errs.push('Rubrik är obligatoriskt.');
    if (!date)        errs.push('Datum är obligatoriskt.');
    if (!start)       errs.push('Starttid är obligatorisk.');
    if (!end)         errs.push('Sluttid är obligatorisk.');
    else if (start && end <= start) errs.push('Sluttid måste vara efter starttid.');
    if (!location)    errs.push('Plats är obligatoriskt.');
    if (!responsible) errs.push('Ansvarig är obligatoriskt.');

    if (errs.length) {
      errBox.hidden = false;
      errBox.innerHTML = errs.map(function (m) { return '<p>' + m + '</p>'; }).join('');
      return;
    }

    errBox.hidden = true;

    var yaml = buildYaml({
      title:       title,
      date:        date,
      start:       start,
      end:         end,
      location:    location,
      responsible: responsible,
      description: els.description.value,
      link:        els.link.value.trim(),
      ownerName:   els.ownerName.value.trim(),
    });

    output.textContent = yaml;
    form.hidden = true;
    result.hidden = false;
    window.scrollTo(0, 0);
  });

  copyBtn.addEventListener('click', function () {
    var text = output.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Kopierat!';
        setTimeout(function () { copyBtn.textContent = 'Kopiera'; }, 2000);
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Kopierat!';
      setTimeout(function () { copyBtn.textContent = 'Kopiera'; }, 2000);
    }
  });

  newBtn.addEventListener('click', function () {
    form.reset();
    form.hidden = false;
    result.hidden = true;
    window.scrollTo(0, 0);
  });
})();
