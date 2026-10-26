import MyModel from '../myModel.model'

/**
 * The goal here is to replicate a bug where importing a .ts model breaks the
 * migration runner.
 */

export async function up(): Promise<void> {
  await MyModel.query().resultSize()
}

export async function down(): Promise<void> {}
