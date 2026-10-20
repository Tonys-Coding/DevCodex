<script lang="ts">
	import Code from '../../components/teach/Code.svelte';
	import Note from '../../components/teach/Note.svelte';
</script>

<h2>What happened</h2>
<p>
	In October 2026, Microsoft ended its agreement to be the main tenant of a new AI data centre being built by Nscale in Loughton, Essex. Reuters
	reported that the local grid had told Nscale it could not supply enough power until the 2030s. The site was planned for 50 megawatts of AI
	computing and 23,040 Nvidia GB300 GPUs, and had been due to open early next year. Microsoft said the decision related to a single site, and
	Nscale said it was looking at other power sources.
</p>

<h2>How much is 50 megawatts?</h2>
<p>A watt is a rate of energy use; a megawatt is a million of them. Some quick arithmetic puts the site in everyday terms:</p>

<Code
	lang="py"
	code={`site_mw = 50                  # the Essex site's computing capacity
gpus = 23_040                 # Nvidia GB300 GPUs planned for it
hours_per_year = 24 * 365

per_gpu_kw = site_mw * 1000 / gpus
year_mwh = site_mw * hours_per_year
homes = year_mwh * 1000 / 2_500     # a typical UK home: 2,500 kWh a year

print(f"{per_gpu_kw:.1f} kW per GPU")        # 2.2 kW per GPU
print(f"{year_mwh:,} MWh a year")            # 438,000 MWh a year
print(f"about {homes:,.0f} homes")           # about 175,200 homes`}
	caption="An upper bound: it assumes the whole site runs flat out all year. Real use is somewhat lower, but the order of size holds."
/>

<p>
	About 2.2 kilowatts per GPU covers the chip and its share of the processors, memory and networking around it, roughly what a kettle draws, for
	every GPU, all day. Running flat out for a year, the site would use about as much electricity as 175,000 typical UK homes. Cooling comes on top.
</p>

<h2>Why the grid is the bottleneck</h2>
<ul>
	<li><strong>Connections take years.</strong> A site this size needs new high-voltage lines, substations and transformers. Planning and building them takes far longer than building the data centre.</li>
	<li><strong>Queues.</strong> Many projects ask for grid connections at once, so new requests wait behind earlier ones.</li>
	<li><strong>Chips arrive faster.</strong> GPUs can be bought and installed in months. A building full of them is worthless without power.</li>
</ul>
<p>
	That is why AI companies increasingly pick locations by available power rather than by where their customers are, and look at building their
	own generation next to the data centre.
</p>

<Note title="Why AI uses so much more" tone="plain">
	Training a large model runs thousands of GPUs at full power for weeks. Answering questions afterwards runs on GPUs too, around the clock, for
	millions of users. Ordinary websites, by contrast, mostly sit idle between requests on cheaper processors.
</Note>

<h2>Why it matters to you</h2>
<p>
	The cost of AI isn’t only the price per token: behind every request is electricity someone had to generate and deliver. Expect power to shape
	where AI runs, what it costs and how fast it grows. It is also a good reason to use smaller models, or no model at all, when a simpler tool does
	the job.
</p>

<h2>Sources</h2>
<ul>
	<li><a href="https://finance.yahoo.com/technology/ai/articles/microsoft-pulls-uk-nscale-data-135037959.html" rel="external">Reuters (via Yahoo Finance): Microsoft pulls out of UK Nscale data centre deal over power delay</a></li>
	<li><a href="https://www.ofgem.gov.uk/sites/default/files/2026-06/Summary-of-changes-to-energy-price-cap-1-July-to-30-September-2026-revised-TDCV.pdf" rel="external">Ofgem: typical household use from 1 July 2026 (2,500 kWh of electricity a year)</a></li>
</ul>
