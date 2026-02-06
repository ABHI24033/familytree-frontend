import Input from "../../common/Input";
import SelectBox from "../../common/SelectBox";
import TextArea from "../../common/TextArea";

const Others = ({ form, handleChange, errors }) => {
  const isChristian = form.religion === 'Christian';

  return (
    <fieldset className="wizard-fieldset show">
      <h6 className="text-md text-neutral-500">Other's Details</h6>

      <div className="row gy-3">

        {/* FOOD PREFERENCE */}
        <SelectBox
          name="foodPreference"
          id="foodPreference"
          required={true}
          label="Food Preference"
          className="col-sm-4"
          value={form.foodPreference}
          onChange={handleChange}
          error={errors.foodPreference}
          options={[
            { label: "veg", value: "veg" },
            { label: "non-veg", value: "non-veg" },
            { label: "both", value: "both" },
            { label: "vegan", value: "vegan" },
            { label: "jain", value: "jain" }
          ]}
        />

        {/* BLOOD GROUP */}
        <SelectBox
          name="bloodGroup"
          id="bloodGroup"
          required={true}
          label="Blood Group"
          className="col-sm-4"
          value={form.bloodGroup}
          onChange={handleChange}
          error={errors.bloodGroup}
          options={[
            { label: "A+", value: "A+" },
            { label: "A-", value: "A-" },
            { label: "B+", value: "B+" },
            { label: "B-", value: "B-" },
            { label: "O+", value: "O+" },
            { label: "O-", value: "O-" },
            { label: "AB+", value: "AB+" },
            { label: "AB-", value: "AB-" },
            { label: "Unknown", value: "Unknown" },
          ]}
        />

        {/* RELIGION DROPDOWN */}
        <SelectBox
          name="religion"
          id="religion"
          label="Religion"
          className="col-sm-4"
          value={form.religion}
          onChange={handleChange}
          error={errors.religion}
          options={[
            { label: "Christian", value: "Christian" },
            { label: "Hindu", value: "Hindu" },
            { label: "Muslim", value: "Muslim" },
            { label: "Sikh", value: "Sikh" },
            { label: "Other", value: "Other" },
          ]}
          required={true}
        />

        {/* ====================== CHURCH RELATED INFO (Conditional) ====================== */}
        {form.religion && (
          <>
            <div className="col-12 mt-4">
              <h6 className="text-md text-neutral-500 mb-2">
                {isChristian ? "Church Related Information" : "Religious Information"}
              </h6>
            </div>

            {isChristian ? (
              <>
                {/* PARISH */}
                <Input
                  name="parish"
                  id="parish"
                  label="Parish"
                  className="col-sm-6"
                  value={form.parish}
                  onChange={handleChange}
                  error={errors.parish}
                />

                {/* CHURCH */}
                <Input
                  name="church"
                  id="church"
                  label="Church"
                  className="col-sm-6"
                  value={form.church}
                  onChange={handleChange}
                  error={errors.church}
                />

                {/* PARISH PRIEST */}
                <Input
                  name="parishPriest"
                  id="parishPriest"
                  label="Parish Priest"
                  className="col-sm-4"
                  value={form.parishPriest}
                  onChange={handleChange}
                  error={errors.parishPriest}
                />

                {/* PARISH COORDINATOR */}
                <Input
                  name="parishCoordinator"
                  id="parishCoordinator"
                  label="Parish Coordinator"
                  className="col-sm-4"
                  value={form.parishCoordinator}
                  onChange={handleChange}
                  error={errors.parishCoordinator}
                />

                {/* PARISH CONTACT */}
                <Input
                  name="parishContact"
                  id="parishContact"
                  label="Parish Coordinator Contact No"
                  className="col-sm-4"
                  value={form.parishContact}
                  onChange={handleChange}
                  error={errors.parishContact}
                />
              </>
            ) : (
              /* NON-CHRISTIAN TEXTAREA */
              <div className="col-12">
                <TextArea
                  id="religionDetails"
                  name="religionDetails"
                  label="Religious Details"
                  placeholder="Add religious information like faith, community, place of worship, or contact number (optional)"
                  className="col-12"
                  value={form.religionDetails}
                  onChange={handleChange}
                />
              </div>
            )}
          </>
        )}


        {/* ====================== DEATH & BURIAL INFO ====================== */}
        <div className="col-12 mt-4">
          <h6 className="text-md text-neutral-500 mb-2">Death & Burial Details</h6>
        </div>

        {/* Date of Death */}
        <Input
          name="dateOfDeath"
          id="dateOfDeath"
          type="date"
          label="Date of Death"
          className="col-sm-6"
          value={form.dateOfDeath}
          onChange={handleChange}
          placeholder="If applicable"
          error={errors.dateOfDeath}
        />

        {/* Death Place (From Personal Info - moved here for grouping) */}
        <Input
          name="deathPlace"
          id="deathPlace"
          label="Death Place"
          className="col-sm-6"
          value={form.deathPlace}
          onChange={handleChange}
          placeholder="Place of death"
          error={errors.deathPlace}
        />

        {/* Burial Place */}
        <Input
          name="burialPlace"
          id="burialPlace"
          label="Burial Place"
          className="col-sm-6"
          value={form.burialPlace}
          onChange={handleChange}
          placeholder="Burial place"
        />


        {/* LIFE HISTORY */}
        <div className="col-12 mt-4">
          <TextArea
            id="lifeHistory"
            name="lifeHistory"
            label="Life History"
            placeholder="Write life history in brief."
            className="col-12"
            value={form.lifeHistory}
            onChange={handleChange}
            error={errors.lifeHistory}
          />
        </div>

      </div>
    </fieldset>
  );
};

export default Others;
