var page = "start_page";
const isdebug = true;

document
.getElementById("deobfuscate_txt")
.addEventListener("click", function () {
  var content = document.getElementById("deez").value;
  var jason;
  var jason2;
  try {
    jason = content.replace(
      /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      (m, g) => (g ? "": m)
    );
    jason2 = JSON.stringify(JSON.parse(jason.replace("}{}", "}")), null, 2);
    document.getElementById("deez").value = jason2;
  } catch (Error) {
    try {
      jason2 = content.replace(/\\u[\dA-F]{4}/gi, function (e) {
        return String.fromCharCode(parseInt(e.replace(/\\u/g, ""), 16));
      });

      document.getElementById("deez").value = jason2;
    } catch (Error) {
      document.getElementById("err0r").textContent = Error;
      setTimeout(function () {
        document.getElementById("err0r").textContent = "";
      }, 4000);
    }
    if (Error.toString().toLowerCase().includes("end of json")) {
      document.getElementById("err0r").textContent = "No input given.";
    } else {
      document.getElementById("err0r").textContent = Error;
    }
    if (Error.toString().toLowerCase().includes("non-whitespace")) {
      document.getElementById("err0r").textContent = "JSON Formatting Error.";
    } else {
      if (!Error.toString().toLowerCase().includes("end of json")) {
        document.getElementById("err0r").textContent = Error;
      }
    }
    setTimeout(function () {
      document.getElementById("err0r").textContent = "";
    }, 4000);
  }
});

document.getElementById("copy_small").addEventListener("click", function () {
  var deez = document.getElementById("deez");
  deez.focus();
  deez.select();
  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful": "unsuccessful";
  } catch (Error) {
    navigator.clipboard.writeText(deez.value);
  }
});

document.getElementById("upload_txt").addEventListener("change", function () {
  var file = upload_txt.files[0];
  var reader = new FileReader();
  reader.onloadend = function (e) {
    var bytes = e.target.result;
    document.getElementById("deez").value = bytes;
    upload_txt.value = "";
  };
  reader.readAsText(file, "UTF-8");
});

document.getElementById("txtpagebtn").addEventListener("click", function () {
  if (page == "start_page" && page != "zip_json") {
    page = "single_json";
    document.getElementById("single_json").style.display = "block";
    document.getElementById("backbtn").style.display = "block";
  }
});

document.getElementById("uppagebtn").addEventListener("click", function () {
  if (page == "start_page" && page != "single_json") {
    page = "zip_json";
    document.getElementById("zip_json").style.display = "block";
    document.getElementById("backbtn").style.display = "block";
  }
});

document.getElementById("backbtn").addEventListener("click", function () {
  if (page != "start_page") {
    if (page != "zip_json") {
      page = "start_page";
      document.getElementById("backbtn").style.display = "none";
      document.getElementById("zip_json").style.display = "none";
      document.getElementById("single_json").style.display = "none";
      document.getElementById("deez").value = "";
      document.getElementById("upload_txt").value = "";
    } else {
      try {
        location.reload();
        return false;
      } catch (Error) {
        try {
          window.location.replace(window.location.pathname);
        } catch (Error) {
          window.location.href = window.location.pathname;
        }
      }
    }
  }
});

document
.getElementById("upload_zip_input")
.addEventListener("change", function () {
  document.getElementById("zipoptions").style.display = "block";
});

document
.getElementById("upload_zip_btn")
.addEventListener("click", function () {
  var zipobject = document.getElementById("upload_zip_input");
  var zipfiles = zipobject.files[0];
  var zipname = zipfiles.name;
  var zip = new JSZip();
  var extensions;
  const progressbar = document.getElementById("loading_zip_bar_progress");
  const progressnum = document.getElementById("zip_bar_num");
  document.getElementById("finished").style.display = "flex";
  try {
    extensions = document
    .getElementById("extensions_holder")
    .value.toLowerCase();
  } catch (Error) {
    extensions = "json";
  }
  JSZip.loadAsync(zipfiles).then(function (zip) {
    var list = Object.keys(zip.files);
    var counter = list.length;
    var barcount = 0;
    var startcount = counter;
    list.forEach(function (filepath) {
      zip.files[filepath].async("string").then(function (filedata) {
        if (filedata != "") {
          if (
            extensions.includes(
              filepath
              .toLowerCase()
              .slice(
                (Math.max(0, filepath.toLowerCase().lastIndexOf(".")) ||
                  Infinity) + 1
              )
            )
          ) {
            var zipjson = filedata.replace(
              /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
              (m, g) => (g ? "": m)
            );
            var zipjson2;
            try {
              zipjson2 = JSON.stringify(
                JSON.parse(zipjson.replace("}{}", "}")),
                null,
                2
              );
            } catch (Error) {
              try {
              zipjson2 = filedata.replace(/\\u[\dA-F]{4}/gi, function (e) {
                return String.fromCharCode(
                  parseInt(e.replace(/\\u/g, ""), 16)
                );
              });
              }
              catch (Error) {
                zipjson2 = filedata;
              }
            }
            zip.file(filepath, zipjson2);
          }
        }
        barcount += 1;
        progressbar.style.width =
        Math.round(((barcount / startcount) * 100)).toString() + "%";
        progressnum.textContent = progressbar.style.width;
        if (counter > 0) {
          counter -= 1;
        }
        if (counter < 1) {
          zip.generateAsync({
            type: "blob",
          }).then(function (content) {
            saveAs(content, zipname);
            progressnum.textContent = "Done!";
            document.getElementById("zip_success").style.display = "block";
          });
        }
      });
    });
  });
});