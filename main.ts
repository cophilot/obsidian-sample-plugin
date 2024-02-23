import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		/* 	const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text"); */

		// This adds a simple command that can be triggered anywhere
		/* this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		}); */
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "paste-single-line",
			name: "Paste single line",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// get content from clipboard
				const clipboard = navigator.clipboard;
				clipboard
					.readText()
					.then((text) => {
						// split into lines
						const newText = text.replace(/\n/g, " ");
						editor.replaceRange(newText, editor.getCursor());
					})
					.catch((err) => {
						console.error(
							"Failed to read clipboard contents: ",
							err
						);
					});
			},
		});

		this.addCommand({
			id: "make-subscript",
			name: "Make Subscript",
			editorCallback: (editor, view) => {
				let selectedText = editor.getSelection();
				// select char before selection when there is no selection
				if (selectedText.length === 0) {
					editor.setSelection(
						{
							line: editor.getCursor().line,
							ch: editor.getCursor().ch - 1,
						},
						editor.getCursor()
					);
					selectedText = editor.getSelection();
				}
				editor.replaceSelection(`<sub>${selectedText}</sub>`);
			},
		});
		this.addCommand({
			id: "make-superscript",
			name: "Make Superscript",
			editorCallback: (editor, view) => {
				let selectedText = editor.getSelection();
				// select char before selection when there is no selection
				if (selectedText.length === 0) {
					editor.setSelection(
						{
							line: editor.getCursor().line,
							ch: editor.getCursor().ch - 1,
						},
						editor.getCursor()
					);
					selectedText = editor.getSelection();
				}
				editor.replaceSelection(`<sup>${selectedText}</sup>`);
			},
		});

		this.addCommand({
			id: "get-greek-letter",
			name: "Get Greek Letter",
			editorCallback: (editor, view) => {
				new GreekLetterModal(this.app, (result) => {
					// add the result to the editor at the cursor position
					editor.replaceRange(result, editor.getCursor());
				}).open();
			},
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		/* this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		}); */

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

export class GreekLetterModal extends Modal {
	result: string;
	uppercase: boolean;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.uppercase = false;
	}

	onOpen() {
		const { contentEl } = this;
		// remove all content
		contentEl.empty();
		// add new content

		contentEl.createEl("h1", { text: "Select a letter" });

		const letters = [
			{
				name: "alpha",
				symbolUpper: "Α",
				symbolLower: "α",
			},
			{
				name: "beta",
				symbolUpper: "Β",
				symbolLower: "β",
			},
			{
				name: "gamma",
				symbolUpper: "Γ",
				symbolLower: "γ",
			},
			{
				name: "delta",
				symbolUpper: "Δ",
				symbolLower: "δ",
			},
			{
				name: "epsilon",
				symbolUpper: "Ε",
				symbolLower: "ε",
			},
			{
				name: "zeta",
				symbolUpper: "Ζ",
				symbolLower: "ζ",
			},
			{
				name: "eta",
				symbolUpper: "Η",
				symbolLower: "η",
			},
			{
				name: "theta",
				symbolUpper: "Θ",
				symbolLower: "θ",
			},
			{
				name: "iota",
				symbolUpper: "Ι",
				symbolLower: "ι",
			},
			{
				name: "kappa",
				symbolUpper: "Κ",
				symbolLower: "κ",
			},
			{
				name: "lambda",
				symbolUpper: "Λ",
				symbolLower: "λ",
			},
			{
				name: "mu",
				symbolUpper: "Μ",
				symbolLower: "μ",
			},
			{
				name: "nu",
				symbolUpper: "Ν",
				symbolLower: "ν",
			},
			{
				name: "xi",
				symbolUpper: "Ξ",
				symbolLower: "ξ",
			},
			{
				name: "omicron",
				symbolUpper: "Ο",
				symbolLower: "ο",
			},
			{
				name: "pi",
				symbolUpper: "Π",
				symbolLower: "π",
			},
			{
				name: "rho",
				symbolUpper: "Ρ",
				symbolLower: "ρ",
			},
			{
				name: "sigma",
				symbolUpper: "Σ",
				symbolLower: "σ",
			},
			{
				name: "tau",
				symbolUpper: "Τ",
				symbolLower: "τ",
			},
			{
				name: "upsilon",
				symbolUpper: "Υ",
				symbolLower: "υ",
			},
			{
				name: "phi",
				symbolUpper: "Φ",
				symbolLower: "φ",
			},
			{
				name: "chi",
				symbolUpper: "Χ",
				symbolLower: "χ",
			},
			{
				name: "psi",
				symbolUpper: "Ψ",
				symbolLower: "ψ",
			},
			{
				name: "omega",
				symbolUpper: "Ω",
				symbolLower: "ω",
			},
		];

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText(this.uppercase ? "Lowercase" : "Uppercase")
				.setCta()
				.onClick(() => {
					this.uppercase = !this.uppercase;
					// rerender the modal
					this.onOpen();
				})
		);

		letters.forEach((letter) => {
			new Setting(contentEl).addButton((btn) =>
				btn
					.setButtonText(
						letter.name +
							" " +
							(this.uppercase
								? letter.symbolUpper
								: letter.symbolLower)
					)
					.onClick(() => {
						this.close();
						this.onSubmit(
							this.uppercase
								? letter.symbolUpper
								: letter.symbolLower
						);
					})
			);
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
