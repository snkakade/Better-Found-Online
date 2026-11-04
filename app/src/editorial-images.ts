/* Illustrative editorial scenes. Actual project videos and campaign reports
   remain the portfolio evidence. Each image has a smaller mobile source. */
function editorialImage(name: string, alt: string) {
  const src = `/assets/editorial/${name}.webp`;
  return { src, srcSet: editorialSrcSet(src), alt, width: 1440, height: 960 };
}

export function editorialSrcSet(src: string) {
  return src.startsWith("/assets/editorial/")
    ? `${src.replace(/\.webp$/, "-720.webp")} 720w, ${src} 1440w`
    : undefined;
}

export const editorialImages = {
  videoEditing: editorialImage("video-editing", "Video editing workstation with a laptop, monitor, headphones and an external drive"),
  cgiMaterials: editorialImage("cgi-materials", "Glass, ceramic and brushed metal material studies beside a 3D modelling screen"),
  motionStoryboards: editorialImage("motion-storyboards", "Six paper storyboard frames planning the movement of a blue circle"),
  graphicPrintProofs: editorialImage("graphic-print-proofs", "Blue geometric print proofs, a red colour swatch and metal clips on a design table"),
  socialContent: editorialImage("social-content", "A phone, printed content photographs and a paper publishing calendar"),
  websitePlanning: editorialImage("website-planning", "Paper website wireframes beside a laptop, pencil and ruler"),
  searchResearch: editorialImage("search-research", "Reference books, blue page tabs and a laptop on a library research desk"),
  campaignPlanning: editorialImage("campaign-planning", "Campaign layouts and planning cards arranged beside a laptop and calculator"),
  productPhotography: editorialImage("product-photography", "Camera and softbox lighting a blue glass bottle on a white tabletop photography set"),
  connectedWorkflow: editorialImage("connected-workflow", "Blue paper workflow cards connected by pencil lines with red approval markers"),
};

/* Illustrative human working scenes, never presented as staff or client proof. */
export const humanImages = {
  creativeShoot: editorialImage("human-creative-shoot", "A camera operator and business owner preparing a product video in a daylight studio"),
  editReview: editorialImage("human-edit-review", "An editor and colleague reviewing footage and an editing timeline at a workstation"),
  websiteWorkshop: editorialImage("human-website-workshop", "A designer and business owner reviewing website layouts together"),
  campaignReview: editorialImage("human-campaign-review", "Two marketing specialists reviewing a campaign plan and laptop dashboard"),
  customerFollowup: editorialImage("human-customer-followup", "A small-business owner following up a customer enquiry by phone"),
  reportReview: editorialImage("human-report-review", "An analyst checking a printed report against information on a laptop"),
  storyboardSession: editorialImage("human-storyboard-session", "Creative collaborators arranging and drawing a sequence of paper storyboards"),
  printCheck: editorialImage("human-print-check", "A graphic designer checking the paper and colour of a printed brochure proof"),
  socialFilming: editorialImage("human-social-filming", "A content creator filming a potter demonstrating a handmade cup"),
  productSet: editorialImage("human-product-set", "A photographer and business owner arranging a tabletop product shoot"),
};
