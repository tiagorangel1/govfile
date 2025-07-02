import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { socksDispatcher } from "fetch-socks";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// make sure a cloudflare warp proxy is running.
// i found https://blog.caomingjun.com/run-cloudflare-warp-in-docker/en/
// with WARP_SLEEP=6 to be pretty good.
const dispatcher = socksDispatcher({
  type: 5,
  host: "::1",
  port: 1080,
});

export default new Elysia()
  .use(
    rateLimit({
      max: 10,
      duration: 60_000, // 1 minute
      scoping: "scoped",
    })
  )
  .use(
    rateLimit({
      max: 60,
      duration: 60 * 60_000, // 1 hour
      scoping: "scoped",
    })
  )
  .onError(({ error }) => {
    return {
      success: false,
      message: error.message,
    };
  })
  .post("/", async ({ body, set }) => {
    const file = body.file;

    if (!file) {
      set.status = 400;
      return { success: false, message: "No file uploaded." };
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100 mb
      set.status = 400;
      return { success: false, message: "File is too large." };
    }

    // to the person from the us government who is reading this:
    // PLEASE DON'T PATCH THIS OR SUE ME ITS JUST FOR FUN
    // 🥺🥺🥺

    const form = new FormData();

    form.append("name_of_nominee[first]", "");
    form.append("name_of_nominee[last]", "");
    form.append("name_of_nominee[suffix]", "");
    form.append("name_of_nominee[degree]", "");
    form.append("date", "");
    form.append("address[address]", "");
    form.append("address[city]", "");
    form.append("address[state_province]", "");
    form.append("address[postal_code]", "");
    form.append("affiliation", "");
    form.append("start_date_of_effort_in_the_cause_of_conservation", "");
    form.append("end_date_of_effort_in_the_cause_of_conservation", "");
    form.append("date_of_death_if_deceased", "");
    form.append("nominated_name[first]", "");
    form.append("nominated_name[last]", "");
    form.append("nominated_name[suffix]", "");
    form.append("nominated_by_address[address]", "");
    form.append("nominated_by_address[city]", "");
    form.append("nominated_by_address[state_province]", "");
    form.append("nominated_by_address[postal_code]", "");
    form.append("email_address", "");
    form.append("nominated_phone", "");
    form.append("nominated_affilation", "");
    form.append("address_of_relative", "");
    form.append("contributions", "");
    form.append("recognition", "");
    form.append("references", "");
    form.append("files[files][]", file);
    form.append("files[fids]", "");
    form.append(
      "files[form_build_id]",
      "form-ApQNJudC43M6Gmvkv_DiJ_E2HEA7mM_A2flLpgiQm0Y"
    );
    form.append(
      "form_id",
      "webform_submission_master_conservationist_award_nom_node_294025_add_form"
    );

    form.append("url", "");
    form.append("_triggering_element_name", "files_upload_button");
    form.append("_triggering_element_value", "Upload");
    form.append("_drupal_ajax", "1");
    form.append("ajax_page_state[theme]", "mdcd8");
    form.append("ajax_page_state[theme_token]", "");
    form.append(
      "ajax_page_state[libraries]",
      "eJyFkl2OwyAMhC-EwuveJjIwSdkCZrHTprdfojRSpTa7LxjPfP4RwkEVbcRaWRDGKaaeiqVFeZTF5ajGfUZmFDRKxl-6XOweBofpUEJbKqVhz57imKI7UC9iPDccIH3Tugux9AmlS98_C9pjmLhlg1VTLNeDfqYmei4CtXKb10VgEj140TFE8XzrxZYLPCeTgw9fVvSRYATZJSoe1jGraKP6ok1clO4Qzq9k5VrRjMRcE8aMmTLKYh31mcI-UupiiDRuW8lrk8Fzrn2Lop_Ad2nQC7bRD1HkfcAdbnsD-4x7R4n67iD12qL91eGvjlfIKRLoj_oApZhkELr9DynPczrHpoS1r3LqZyo07z_rvEmGSKdOfa4a-0849aVfvL7Z2_ELkYItpw"
    );

    const response = await (
      await fetch(
        "https://mdc.mo.gov/about-us/awards-honors/master-conservationist-award-nomination?element_parents=elements/flexbox_02/nominated_by/files&ajax_form=1&_wrapper_format=drupal_ajax",
        {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            pragma: "no-cache",
            priority: "u=1, i",
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
            "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-requested-with": "XMLHttpRequest",
          },
          method: "POST",
          body: form,
          dispatcher,
        }
      )
    ).json();

    const command = response.find((c) => c.command === "insert").data;

    const dom = new JSDOM(command);

    const URL_BASE = "https://mdc.mo.gov";
    const url = dom.window.document
      .querySelector("label.option .file a[href]")
      .getAttribute("href");

    if (!url) {
      return {
        success: false,
        message: "missing url",
      };
    }

    return {
      success: true,
      url: URL_BASE + url,
    };
  });
