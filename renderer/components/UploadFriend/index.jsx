import axios from "axios";
import React from "react";
// Instructions on line 80

class UploadModal {
  filename = "";
  isCopying = false;
  isUploading = false;
  progress = 0;
  progressTimeout = null;
  state = 0;
  shareEmail = "";

  constructor(el, shareEmail) {
    this.el = document.querySelector(el);
    this.shareEmail = shareEmail;
    // Listen for file drop on the entire window
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      const event = new Event("click");
      const event2 = new Event("change");
      const fileField = document.getElementById("file");

      fileField.files = e.dataTransfer.files;
      document.getElementById("upload").dispatchEvent(event);
      fileField.dispatchEvent(event2);
    });
    this.el?.addEventListener("click", this.action.bind(this));
    this.el?.querySelector("#file")?.addEventListener("change", this.fileHandle.bind(this));
  }

  action(e) {
    this[e.target?.getAttribute("data-action")]?.();
    this.stateDisplay();
  }
  cancel() {
    this.isUploading = false;
    this.progress = 0;
    this.progressTimeout = null;
    this.state = 0;
    this.stateDisplay();
    this.progressDisplay();
    this.fileReset();
  }
  async copy() {
    const copyButton = this.el?.querySelector("[data-action='copy']");

    if (!this.isCopying && copyButton) {
      // disable
      this.isCopying = true;
      copyButton.style.width = `${copyButton.offsetWidth}px`;
      copyButton.disabled = true;
      copyButton.textContent = "Copied!";
      navigator.clipboard.writeText(this.filename);
      await new Promise((res) => setTimeout(res, 1000));
      // reenable
      this.isCopying = false;
      copyButton.removeAttribute("style");
      copyButton.disabled = false;
      copyButton.textContent = "Copy Link";
    }
  }
  fail() {
    this.isUploading = false;
    this.progress = 0;
    this.progressTimeout = null;
    this.state = 2;
    this.stateDisplay();
  }
  file() {
    this.el?.querySelector("#file").click();
  }
  fileDisplay(name = "") {
    // update the name
    this.filename = name;

    const fileValue = this.el?.querySelector("[data-file]");
    if (fileValue) fileValue.textContent = this.filename;

    // show the file
    this.el?.setAttribute("data-ready", this.filename ? "true" : "false");
  }
  fileHandle(e) {
    return new Promise(() => {
      const { target } = e;
      if (target?.files.length) {
        let reader = new FileReader();
        reader.onload = (e2) => {
          // @Rudra: This is where you can get the file data target.files[0] is the file object.
          axios
            .post(
              `http://localhost:${process.env.NEXT_PUBLIC_PORT}/shareable-file`,
              {
                filePath: target.files[0].path,
                shareEmail: shareEmail,
              }
            )
            .then((res) => {
              this.fileDisplay(target.files[0].name);
            })
            .catch((err) => {
              console.log(err);
            });
        };
        reader.readAsDataURL(target.files[0]);
      }
    });
  }
  fileReset() {
    const fileField = this.el?.querySelector("#file");
    if (fileField) fileField.value = null;

    this.fileDisplay();
  }
  progressDisplay() {
    const progressValue = this.el?.querySelector("[data-progress-value]");
    const progressFill = this.el?.querySelector("[data-progress-fill]");
    const progressTimes100 = Math.floor(this.progress * 100);

    if (progressValue) progressValue.textContent = `${progressTimes100}%`;
    if (progressFill) progressFill.style.transform = `translateX(${progressTimes100}%)`;
  }
  async progressLoop() {
    this.progressDisplay();

    if (this.isUploading) {
      if (this.progress === 0) {
        await new Promise((res) => setTimeout(res, 1000));
        // fail randomly
        if (!this.isUploading) {
          return;
        } else if (Utils.randomInt(0, 2) === 0) {
          this.fail();
          return;
        }
      }
      // …or continue with progress
      if (this.progress < 1) {
        this.progress += 0.01;
        this.progressTimeout = setTimeout(this.progressLoop.bind(this), 50);
      } else if (this.progress >= 1) {
        this.progressTimeout = setTimeout(() => {
          if (this.isUploading) {
            this.success();
            this.stateDisplay();
            this.progressTimeout = null;
          }
        }, 250);
      }
    }
  }
  stateDisplay() {
    this.el?.setAttribute("data-state", `${this.state}`);
  }
  success() {
    this.isUploading = false;
    this.state = 3;
    this.stateDisplay();
  }
  upload() {
    if (!this.isUploading) {
      this.isUploading = true;
      this.progress = 0;
      this.state = 1;
      this.progressLoop();
    }
  }
}

class Utils {
  static randomInt(min = 0, max = 2 ** 32) {
    const percent = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const relativeValue = (max - min) * percent;

    return Math.round(min + relativeValue);
  }
}

export default function UploadFriend({ shareEmail }) {
  React.useEffect(() => {
    let upload = new UploadModal("#upload", shareEmail);

    return () => {
      upload = null;
    };
  }, []);

  return (
    <div id="upload" className="modal" data-state={0} data-ready="false">
      <div className="modal__header"></div>
      <div className="modal__body">
        <div className="modal__col">
          {/* up */}
          <svg className="modal__icon modal__icon--blue" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
            <g fill="none" stroke="hsl(223,90%,50%)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle className="modal__icon-sdo69" cx={12} cy={12} r={11} strokeDasharray="69.12 69.12" />
              <polyline className="modal__icon-sdo14" points="7 12 12 7 17 12" strokeDasharray="14.2 14.2" />
              <line className="modal__icon-sdo10" x1={12} y1={7} x2={12} y2={17} strokeDasharray="10 10" />
            </g>
          </svg>
          {/* error */}
          <svg className="modal__icon modal__icon--red" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true" display="none">
            <g fill="none" stroke="hsl(3,90%,50%)" strokeWidth={2} strokeLinecap="round">
              <circle className="modal__icon-sdo69" cx={12} cy={12} r={11} strokeDasharray="69.12 69.12" />
              <line className="modal__icon-sdo14" x1={7} y1={7} x2={17} y2={17} strokeDasharray="14.2 14.2" />
              <line className="modal__icon-sdo14" x1={17} y1={7} x2={7} y2={17} strokeDasharray="14.2 14.2" />
            </g>
          </svg>
          {/* check */}
          <svg className="modal__icon modal__icon--green" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true" display="none">
            <g fill="none" stroke="hsl(138,90%,50%)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle className="modal__icon-sdo69" cx={12} cy={12} r={11} strokeDasharray="69.12 69.12" />
              <polyline className="modal__icon-sdo14" points="7 12.5 10 15.5 17 8.5" strokeDasharray="14.2 14.2" />
            </g>
          </svg>
        </div>
        <div className="modal__col">
          <div className="modal__content">
            <h2 className="modal__title">Upload a File</h2>
            <p className="modal__message">Select a file to upload from your computer or device.</p>
            <div className="modal__actions">
              <button className="modal__button modal__button--upload" type="button" data-action="file">
                Choose File
              </button>
              <input id="file" type="file" hidden />
            </div>
            <div className="modal__actions" hidden>
              <svg className="modal__file-icon" viewBox="0 0 24 24" width="24px" height="24px" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="4 1 12 1 20 8 20 23 4 23" />
                  <polyline points="12 1 12 8 20 8" />
                </g>
              </svg>
              <div className="modal__file" data-file />
              <button className="modal__close-button" type="button" data-action="fileReset">
                <svg className="modal__close-icon" viewBox="0 0 16 16" width="16px" height="16px" aria-hidden="true">
                  <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <polyline points="4,4 12,12" />
                    <polyline points="12,4 4,12" />
                  </g>
                </svg>
                <span className="modal__sr">Remove</span>
              </button>
              <button className="modal__button" type="button" data-action="upload">
                Upload
              </button>
            </div>
          </div>
          <div className="modal__content" hidden>
            <h2 className="modal__title">Uploading…</h2>
            <p className="modal__message">Just give us a moment to process your file.</p>
            <div className="modal__actions">
              <div className="modal__progress">
                <div className="modal__progress-value" data-progress-value>
                  0%
                </div>
                <div className="modal__progress-bar">
                  <div className="modal__progress-fill" data-progress-fill />
                </div>
              </div>
              <button className="modal__button" type="button" data-action="cancel">
                Cancel
              </button>
            </div>
          </div>
          <div className="modal__content" hidden>
            <h2 className="modal__title">Oops!</h2>
            <p className="modal__message">Your file could not be uploaded due to an error. Try uploading it again?</p>
            <div className="modal__actions modal__actions--center">
              <button className="modal__button" type="button" data-action="upload">
                Retry
              </button>
              <button className="modal__button" type="button" data-action="cancel">
                Cancel
              </button>
            </div>
          </div>
          <div className="modal__content" hidden>
            <h2 className="modal__title">Upload Successful!</h2>
            <p className="modal__message">Your file has been uploaded. You can copy the link to your clipboard.</p>
            <div className="modal__actions modal__actions--center">
              <button className="modal__button" type="button" data-action="copy">
                Copy Link
              </button>
              <button className="modal__button" type="button" data-action="cancel">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
